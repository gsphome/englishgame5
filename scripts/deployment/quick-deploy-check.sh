#!/bin/bash

# Quick GitHub Pages Deployment Check
# Simple curl-based validation for GitHub Pages deployment

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="gsphome"
REPO_NAME="englishgame5"
PAGES_URL="https://${REPO_OWNER}.github.io/${REPO_NAME}/"
API_BASE="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}"

echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}🚀 Quick GitHub Pages Deployment Check${NC}"
echo -e "${CYAN}============================================================${NC}"

# Get current commit
CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null | cut -c1-8)
if [ $? -eq 0 ]; then
    echo -e "${BLUE}ℹ️ Current commit: ${CURRENT_COMMIT}${NC}"
else
    echo -e "${YELLOW}⚠️ Could not get current commit${NC}"
fi

echo ""

# 1. Test site accessibility
echo -e "${BLUE}🌐 Testing site accessibility...${NC}"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}:%{time_total}:%{url_effective}" --max-time 10 "$PAGES_URL")

if [ $? -eq 0 ]; then
    HTTP_CODE=$(echo $HTTP_RESPONSE | cut -d: -f1)
    RESPONSE_TIME=$(echo $HTTP_RESPONSE | cut -d: -f2)
    FINAL_URL=$(echo $HTTP_RESPONSE | cut -d: -f3-)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Site is accessible (HTTP $HTTP_CODE)${NC}"
        echo -e "${BLUE}ℹ️ Response time: ${RESPONSE_TIME}s${NC}"
        echo -e "${BLUE}ℹ️ URL: $FINAL_URL${NC}"
    else
        echo -e "${RED}❌ Site returned HTTP $HTTP_CODE${NC}"
        echo -e "${BLUE}ℹ️ URL: $FINAL_URL${NC}"
    fi
else
    echo -e "${RED}❌ Failed to connect to site${NC}"
fi

echo ""

# 2. Check GitHub Pages API
echo -e "${BLUE}📋 Checking GitHub Pages configuration...${NC}"
PAGES_INFO=$(curl -s -H "Accept: application/vnd.github.v3+json" "${API_BASE}/pages")

if echo "$PAGES_INFO" | grep -q '"status"'; then
    STATUS=$(echo "$PAGES_INFO" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    SOURCE_BRANCH=$(echo "$PAGES_INFO" | grep -o '"branch":"[^"]*"' | cut -d'"' -f4)
    
    if [ "$STATUS" = "built" ]; then
        echo -e "${GREEN}✅ Pages status: $STATUS${NC}"
    else
        echo -e "${YELLOW}⚠️ Pages status: $STATUS${NC}"
    fi
    
    if [ ! -z "$SOURCE_BRANCH" ]; then
        echo -e "${BLUE}ℹ️ Source branch: $SOURCE_BRANCH${NC}"
    fi
else
    echo -e "${RED}❌ Could not fetch Pages configuration${NC}"
fi

echo ""

# 3. Check latest deployment
echo -e "${BLUE}📦 Checking latest deployment...${NC}"
# Try production environment first, then github-pages as fallback
DEPLOYMENT_INFO=$(curl -s -H "Accept: application/vnd.github.v3+json" "${API_BASE}/deployments?environment=production&per_page=1")
if ! echo "$DEPLOYMENT_INFO" | grep -q '"id"'; then
    DEPLOYMENT_INFO=$(curl -s -H "Accept: application/vnd.github.v3+json" "${API_BASE}/deployments?environment=github-pages&per_page=1")
fi

# Parse JSON array - get first deployment
if echo "$DEPLOYMENT_INFO" | grep -q '\[.*\]' && echo "$DEPLOYMENT_INFO" | grep -q '"id"'; then
    # Extract values from the JSON array
    DEPLOYMENT_ID=$(echo "$DEPLOYMENT_INFO" | sed -n 's/.*"id": *\([0-9]*\).*/\1/p' | head -1)
    DEPLOYMENT_SHA=$(echo "$DEPLOYMENT_INFO" | sed -n 's/.*"sha": *"\([^"]*\)".*/\1/p' | head -1 | cut -c1-8)
    CREATED_AT=$(echo "$DEPLOYMENT_INFO" | sed -n 's/.*"created_at": *"\([^"]*\)".*/\1/p' | head -1)
    ENVIRONMENT=$(echo "$DEPLOYMENT_INFO" | sed -n 's/.*"environment": *"\([^"]*\)".*/\1/p' | head -1)
    
    echo -e "${BLUE}ℹ️ Deployment ID: $DEPLOYMENT_ID${NC}"
    echo -e "${BLUE}ℹ️ Deployed SHA: $DEPLOYMENT_SHA${NC}"
    echo -e "${BLUE}ℹ️ Environment: $ENVIRONMENT${NC}"
    echo -e "${BLUE}ℹ️ Created: $CREATED_AT${NC}"
    
    # Compare with current commit
    if [ ! -z "$CURRENT_COMMIT" ] && [ ! -z "$DEPLOYMENT_SHA" ]; then
        if [ "$CURRENT_COMMIT" = "$DEPLOYMENT_SHA" ]; then
            echo -e "${GREEN}✅ Current commit is deployed${NC}"
        else
            echo -e "${YELLOW}⚠️ Current commit differs from deployed${NC}"
            echo -e "${BLUE}ℹ️ Local: $CURRENT_COMMIT | Deployed: $DEPLOYMENT_SHA${NC}"
        fi
    fi
    
    # Check deployment status
    STATUS_INFO=$(curl -s -H "Accept: application/vnd.github.v3+json" "${API_BASE}/deployments/${DEPLOYMENT_ID}/statuses")
    if echo "$STATUS_INFO" | grep -q '"state"'; then
        DEPLOY_STATE=$(echo "$STATUS_INFO" | grep -o '"state":"[^"]*"' | head -1 | cut -d'"' -f4)
        
        case "$DEPLOY_STATE" in
            "success")
                echo -e "${GREEN}✅ Deployment status: $DEPLOY_STATE${NC}"
                ;;
            "pending"|"in_progress")
                echo -e "${YELLOW}⏳ Deployment status: $DEPLOY_STATE${NC}"
                ;;
            "failure"|"error")
                echo -e "${RED}❌ Deployment status: $DEPLOY_STATE${NC}"
                ;;
            *)
                echo -e "${BLUE}ℹ️ Deployment status: $DEPLOY_STATE${NC}"
                ;;
        esac
    fi
else
    echo -e "${RED}❌ Could not fetch deployment information${NC}"
fi

echo ""

# 4. Summary
echo -e "${CYAN}📊 Summary:${NC}"

# Determine overall status
OVERALL_STATUS="UNKNOWN"
if [ "$HTTP_CODE" = "200" ] && [ "$STATUS" = "built" ] && [ "$DEPLOY_STATE" = "success" ]; then
    OVERALL_STATUS="HEALTHY"
    echo -e "${GREEN}✅ Overall Status: $OVERALL_STATUS${NC}"
    echo -e "${GREEN}✨ Deployment is healthy and accessible!${NC}"
elif [ "$DEPLOY_STATE" = "pending" ] || [ "$DEPLOY_STATE" = "in_progress" ]; then
    OVERALL_STATUS="DEPLOYING"
    echo -e "${YELLOW}⏳ Overall Status: $OVERALL_STATUS${NC}"
    echo -e "${YELLOW}🔄 Deployment is in progress...${NC}"
else
    OVERALL_STATUS="ISSUES"
    echo -e "${RED}❌ Overall Status: $OVERALL_STATUS${NC}"
    echo -e "${RED}🚨 Deployment has issues that need attention${NC}"
fi

echo -e "${CYAN}============================================================${NC}"

# Exit with appropriate code
if [ "$OVERALL_STATUS" = "HEALTHY" ]; then
    exit 0
else
    exit 1
fi
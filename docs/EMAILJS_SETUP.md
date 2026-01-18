# EmailJS Setup Guide for IPDC Platform Email Notifications

This guide will help you set up **free** email notifications using EmailJS so that tenants receive real emails when their service requests are approved, rejected, or updated.

## Why EmailJS?

- ✅ **100% FREE** for up to 200 emails/month
- ✅ No credit card required
- ✅ Easy setup (5 minutes)
- ✅ Works with any email provider (Gmail, Outlook, etc.)
- ✅ Already integrated in the codebase

## Step 1: Create Free EmailJS Account

1. Go to https://www.emailjs.com/
2. Click "Sign Up Free"
3. Create account with your email (or use Google/GitHub sign-in)
4. Verify your email address

## Step 2: Add Email Service

1. After login, go to "Email Services" in the left sidebar
2. Click "Add New Service"
3. Choose your email provider (Gmail recommended for testing)
4. Click "Connect Account" and sign in
5. **Copy the Service ID** (looks like service_abc1234)

## Step 3: Create Email Template

1. Go to "Email Templates" in the left sidebar
2. Click "Create New Template"
3. Template Name: service_request_notification
4. Use the HTML template provided in the full guide
5. **Copy the Template ID** (looks like template_xyz5678)

## Step 4: Get Your Public Key

1. Go to "Account" → "General"
2. Find "Public Key" section
3. **Copy your Public Key** (looks like AbC123dEf456GhI789)

## Step 5: Update Your .env File

Replace these values in ipdc-platform/.env:

VITE_EMAILJS_SERVICE_ID=service_abc1234
VITE_EMAILJS_TEMPLATE_ID=template_xyz5678
VITE_EMAILJS_PUBLIC_KEY=AbC123dEf456GhI789

## Step 6: Restart Dev Server

cd ipdc-platform
npm run dev

## Step 7: Test Notifications

1. Register a new tenant with a real email
2. Create service request as tenant
3. Approve request as admin
4. Check email inbox for notification!

For detailed instructions, see full documentation at https://www.emailjs.com/docs/

# FinTrack Deployment Guide

This guide covers various deployment options for FinTrack.

## Table of Contents
- [Automated CI/CD with GitHub Actions](#automated-cicd-with-github-actions)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Environment Variables](#environment-variables)
- [Security Considerations](#security-considerations)

## Automated CI/CD with GitHub Actions

FinTrack includes a GitHub Actions workflow that automatically builds and publishes Docker images to GitHub Container Registry (GHCR).

### Workflow Triggers

The workflow (`.github/workflows/publish_ghcr.yml`) is triggered by:
- **Manual dispatch**: Run the workflow manually from GitHub Actions tab
- **Repository dispatch**: Trigger from external systems or other workflows
- **Release creation**: Automatically run when a new release is created

### What the Workflow Does

1. Checks out the repository code
2. Sets up Node.js environment
3. Configures Docker Buildx for advanced builds
4. Authenticates with GitHub Container Registry
5. Extracts metadata and generates proper image tags
6. Builds the Docker image
7. Pushes the image to ghcr.io with appropriate tags
8. Uses GitHub Actions cache for faster subsequent builds

### Image Tags Generated

- `latest` - For builds from the main branch
- `v{major}.{minor}.{patch}` - Semantic version tags from releases
- `{major}.{minor}` - Major.minor version tags
- `{major}` - Major version tags
- Custom version tags based on run number

### Running the Workflow Manually

1. Go to your repository on GitHub
2. Click on **Actions** tab
3. Select **Publish: Docker Image to GHCR** workflow
4. Click **Run workflow** button
5. Select the branch and click **Run workflow**

### Using the Published Images

Images are published to: `ghcr.io/nguyenquy0710/financial-tracking`

See [Using Pre-built Images from GitHub Container Registry](#using-pre-built-images-from-github-container-registry) section below for usage instructions.

## Docker Deployment

The easiest way to deploy FinTrack is using Docker and Docker Compose.

### Prerequisites
- Docker >= 20.10
- Docker Compose >= 2.0

### Quick Start with Docker Compose

1. **Clone the repository**
```bash
git clone https://github.com/nguyenquy0710/Financial-Tracking.git
cd Financial-Tracking
```

2. **Set environment variables**
```bash
# Create .env file
cat > .env << EOF
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF
```

3. **Start the application**
```bash
docker-compose up -d
```

4. **Check status**
```bash
docker-compose ps
```

5. **View logs**
```bash
docker-compose logs -f api
```

6. **Stop the application**
```bash
docker-compose down
```

7. **Stop and remove all data**
```bash
docker-compose down -v
```

### Building Docker Image

```bash
# Build the image
docker build -t fintrack:latest .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://your-mongodb:27017/fintrack \
  -e JWT_SECRET=your-secret-key \
  --name fintrack-api \
  fintrack:latest
```

### Using Pre-built Images from GitHub Container Registry

FinTrack Docker images are automatically published to GitHub Container Registry (GHCR) when a new release is created.

**Pull and run the latest image:**
```bash
# Pull the latest image
docker pull ghcr.io/nguyenquy0710/financial-tracking:latest

# Run the container
docker run -d \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://your-mongodb:27017/fintrack \
  -e JWT_SECRET=your-secret-key \
  --name fintrack-api \
  ghcr.io/nguyenquy0710/financial-tracking:latest
```

**Using with Docker Compose:**
Update your `docker-compose.yml` to use the GHCR image:
```yaml
services:
  api:
    image: ghcr.io/nguyenquy0710/financial-tracking:latest
    # ... rest of your configuration
```

**Available tags:**
- `latest` - Latest stable release from main branch
- `v1.0.x` - Specific version tags
- `main` - Latest build from main branch
- Semantic version tags (e.g., `1.0`, `1`)

**Authentication (for private repositories):**
```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull the image
docker pull ghcr.io/nguyenquy0710/financial-tracking:latest
```

## Manual Deployment

### Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 4.4
- PM2 (optional, for process management)

### Step 1: Prepare the Server

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
# Follow: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

# Install PM2 globally
sudo npm install -g pm2
```

### Step 2: Deploy Application

```bash
# Clone repository
git clone https://github.com/nguyenquy0710/Financial-Tracking.git
cd Financial-Tracking

# Install dependencies
npm ci --only=production

# Create .env file
cp .env.example .env
nano .env  # Edit with your configuration
```

### Step 3: Configure Environment

Edit `.env` file:
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/fintrack
JWT_SECRET=your-super-secure-secret-key-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
```

### Step 4: Initialize Database

```bash
npm run init:db
```

### Step 5: Start with PM2

```bash
# Start application
pm2 start src/index.js --name fintrack

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions shown

# Monitor application
pm2 monit

# View logs
pm2 logs fintrack

# Restart application
pm2 restart fintrack

# Stop application
pm2 stop fintrack
```

### Step 6: Setup Nginx Reverse Proxy (Optional)

```bash
# Install Nginx
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/fintrack
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/fintrack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Setup SSL with Let's Encrypt (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
# Test renewal with:
sudo certbot renew --dry-run
```

## Cloud Deployment

### Deploy to Heroku

1. **Install Heroku CLI**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku app**
```bash
heroku create your-fintrack-app
```

4. **Add MongoDB addon**
```bash
heroku addons:create mongolab:sandbox
```

5. **Set environment variables**
```bash
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set NODE_ENV=production
```

6. **Deploy**
```bash
git push heroku main
```

7. **Open application**
```bash
heroku open
```

### Deploy to AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu Server 22.04 LTS
   - t2.micro or larger
   - Configure security group (ports 22, 80, 443, 3000)

2. **Connect to instance**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Follow Manual Deployment steps above**

### Deploy to DigitalOcean

1. **Create Droplet**
   - Ubuntu 22.04
   - Basic plan ($6/month minimum)
   - Add SSH key

2. **Connect to droplet**
```bash
ssh root@your-droplet-ip
```

3. **Follow Manual Deployment steps above**

### Deploy to Google Cloud Run

1. **Install gcloud CLI**
```bash
curl https://sdk.cloud.google.com | bash
```

2. **Build and push image**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/fintrack
```

3. **Deploy to Cloud Run**
```bash
gcloud run deploy fintrack \
  --image gcr.io/PROJECT_ID/fintrack \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Environment Variables

### Required Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (use a strong random string)

### Optional Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `JWT_EXPIRES_IN` - Token expiration time (default: 7d)
- `CORS_ORIGIN` - Allowed CORS origins (default: *)

### Generating Secure JWT Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` file to version control
- Use strong, random JWT secret
- Rotate secrets regularly

### 2. Database Security
- Enable MongoDB authentication
- Use strong passwords
- Restrict network access
- Enable encryption at rest

### 3. API Security
- Use HTTPS in production
- Implement rate limiting
- Enable CORS only for trusted domains
- Keep dependencies updated

### 4. Firewall Configuration
```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### 5. Monitoring and Logging
- Use PM2 or similar for process monitoring
- Configure log rotation
- Set up error alerting
- Monitor resource usage

## Backup and Recovery

### MongoDB Backup

```bash
# Backup
mongodump --uri="mongodb://localhost:27017/fintrack" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/fintrack" /backup/20240101
```

### Automated Backups with Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * mongodump --uri="mongodb://localhost:27017/fintrack" --out=/backup/$(date +\%Y\%m\%d) && find /backup -mtime +7 -delete
```

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm ci --only=production

# Restart application
pm2 restart fintrack
```

### Monitor Application

```bash
# PM2 monitoring
pm2 monit

# Check logs
pm2 logs fintrack

# Application health
curl http://localhost:3000/health
```

## Troubleshooting

### Application won't start
- Check MongoDB connection
- Verify environment variables
- Check logs: `pm2 logs fintrack`
- Ensure port 3000 is available

### Database connection errors
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check connection string in `.env`
- Verify firewall rules

### Performance issues
- Monitor with `pm2 monit`
- Check MongoDB indexes
- Review logs for errors
- Consider scaling resources

## Support

For deployment issues:
1. Check logs first
2. Review [Quick Start Guide](QUICKSTART.md)
3. Search [GitHub Issues](https://github.com/nguyenquy0710/Financial-Tracking/issues)
4. Create new issue with deployment details

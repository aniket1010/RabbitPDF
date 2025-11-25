# 🐳 Docker Interview Guide - Complete Explanation

A comprehensive guide to Docker concepts for interview preparation.

---

## 📚 **Table of Contents:**

1. [What is Docker?](#what-is-docker)
2. [Docker Images](#docker-images)
3. [Docker Containers](#docker-containers)
4. [Dockerfile](#dockerfile)
5. [Docker Compose](#docker-compose)
6. [Key Concepts](#key-concepts)
7. [Common Interview Questions](#common-interview-questions)

---

## 🎯 **What is Docker?**

### **Simple Explanation:**

**Docker is a platform that packages applications and their dependencies into lightweight, portable containers.**

**Think of it like:**
- 📦 **Shipping Container** → Same container works on any ship/truck/train
- 🐳 **Docker Container** → Same container works on any computer/server

### **Key Benefits:**

1. **Consistency:** "Works on my machine" → "Works everywhere"
2. **Isolation:** Each app runs in its own environment
3. **Portability:** Run anywhere (local, cloud, server)
4. **Efficiency:** Share OS kernel, less overhead than VMs

### **Docker vs Virtual Machines:**

| Docker | Virtual Machines |
|-------|------------------|
| Lightweight (MBs) | Heavy (GBs) |
| Fast startup (seconds) | Slow startup (minutes) |
| Shares OS kernel | Each VM has own OS |
| Less resource usage | More resource usage |

**Analogy:**
- **VM:** Building separate houses (each with own foundation)
- **Docker:** Apartment building (shared foundation, separate units)

---

## 🖼️ **Docker Images**

### **What is an Image?**

**An image is a read-only template used to create containers.**

**Think of it like:**
- 📸 **Photo** → Template/Blueprint
- 🏠 **House Blueprint** → Image
- 🏠 **Actual House** → Container

### **Image Layers:**

Images are built in **layers** (like an onion):

```
┌─────────────────────┐
│   Your Application  │  ← Layer 4 (your code)
├─────────────────────┤
│   Dependencies      │  ← Layer 3 (npm packages)
├─────────────────────┤
│   Node.js Runtime   │  ← Layer 2 (Node.js)
├─────────────────────┤
│   Linux Base (Alpine)│  ← Layer 1 (OS)
└─────────────────────┘
```

**Why layers?**
- ✅ **Reusability:** Share base layers across images
- ✅ **Caching:** Only rebuild changed layers
- ✅ **Efficiency:** Smaller image sizes

### **Image Commands:**

```bash
# List images
docker images

# Build image from Dockerfile
docker build -t myapp:latest .

# Pull image from registry
docker pull node:18-alpine

# Remove image
docker rmi myapp:latest
```

### **Image Registries:**

- **Docker Hub:** Public registry (like GitHub for images)
- **AWS ECR:** Amazon's registry
- **Google Container Registry:** Google's registry
- **Private registries:** Your company's registry

---

## 📦 **Docker Containers**

### **What is a Container?**

**A container is a running instance of an image.**

**Think of it like:**
- 🖼️ **Image** = Blueprint/Recipe
- 📦 **Container** = Actual running application

### **Container Lifecycle:**

```
Image → Container (Created) → Container (Running) → Container (Stopped) → Container (Removed)
```

### **Container Commands:**

```bash
# Create and start container
docker run -d -p 3000:3000 myapp:latest

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop container
docker stop container_id

# Start stopped container
docker start container_id

# Remove container
docker rm container_id

# View container logs
docker logs container_id

# Execute command in running container
docker exec -it container_id /bin/sh
```

### **Container vs Image:**

| Image | Container |
|-------|-----------|
| Read-only | Read-write |
| Template | Running instance |
| Stored on disk | Running in memory |
| Can't be modified | Can be modified |
| Multiple containers from one image | One container from one image |

**Analogy:**
- **Image** = Class (blueprint)
- **Container** = Object (instance)

---

## 📝 **Dockerfile**

### **What is a Dockerfile?**

**A Dockerfile is a text file with instructions to build an image.**

**Think of it like:**
- 📋 **Recipe** → Instructions to cook
- 📝 **Dockerfile** → Instructions to build image

### **Dockerfile Example:**

```dockerfile
# Start from base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Run command when container starts
CMD ["node", "server.js"]
```

### **Common Dockerfile Instructions:**

| Instruction | Purpose | Example |
|-------------|---------|---------|
| `FROM` | Base image | `FROM node:18-alpine` |
| `WORKDIR` | Set working directory | `WORKDIR /app` |
| `COPY` | Copy files | `COPY . .` |
| `RUN` | Execute command during build | `RUN npm install` |
| `EXPOSE` | Document port (doesn't publish) | `EXPOSE 3000` |
| `CMD` | Default command when container starts | `CMD ["node", "app.js"]` |
| `ENV` | Set environment variable | `ENV NODE_ENV=production` |
| `ARG` | Build-time variable | `ARG VERSION=1.0` |

### **Dockerfile Best Practices:**

1. **Use specific tags:** `node:18-alpine` not `node:latest`
2. **Order matters:** Put frequently changing layers last
3. **Use .dockerignore:** Exclude unnecessary files
4. **Multi-stage builds:** Reduce final image size
5. **Don't run as root:** Use non-root user

---

## 🎼 **Docker Compose**

### **What is Docker Compose?**

**Docker Compose is a tool to define and run multi-container applications.**

**Think of it like:**
- 🎼 **Orchestra Conductor** → Coordinates multiple instruments
- 🐳 **Docker Compose** → Coordinates multiple containers

### **Why Docker Compose?**

**Instead of running:**
```bash
docker run -d postgres
docker run -d redis
docker run -d backend
docker run -d frontend
```

**You write one file and run:**
```bash
docker-compose up -d
```

### **docker-compose.yml Example:**

```yaml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: mypassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Backend
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://postgres:mypassword@postgres:5432/mydb

  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### **Docker Compose Commands:**

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs

# Rebuild images
docker-compose build

# Scale service
docker-compose up -d --scale backend=3
```

---

## 🔑 **Key Concepts**

### **1. Volumes**

**Volumes persist data outside containers.**

**Why?** Containers are ephemeral - when removed, data is lost.

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data  # Named volume
  - ./uploads:/app/uploads                   # Bind mount
```

**Types:**
- **Named volumes:** Managed by Docker
- **Bind mounts:** Direct path mapping
- **tmpfs mounts:** In-memory (temporary)

### **2. Networks**

**Networks allow containers to communicate.**

```yaml
networks:
  - my-network

# Containers on same network can communicate by service name
# backend can reach postgres at: postgres:5432
```

**Default networks:**
- **bridge:** Default network
- **host:** Use host's network
- **none:** No network

### **3. Ports**

**Port mapping: host → container**

```yaml
ports:
  - "3000:3000"  # host:container
  # Access from host at localhost:3000
  # Maps to container port 3000
```

### **4. Environment Variables**

**Pass configuration to containers:**

```yaml
environment:
  NODE_ENV: production
  DATABASE_URL: postgresql://...

# Or from file
env_file:
  - .env.production
```

### **5. Health Checks**

**Monitor container health:**

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

## 💼 **Common Interview Questions**

### **1. What is Docker and why use it?**

**Answer:**
"Docker is a containerization platform that packages applications with their dependencies into lightweight, portable containers. Benefits include:
- Consistency across environments
- Isolation between applications
- Efficient resource usage
- Easy deployment and scaling"

### **2. What's the difference between an image and a container?**

**Answer:**
"An image is a read-only template used to create containers. A container is a running instance of an image. Think of it like: image = class, container = object. You can create multiple containers from one image."

### **3. What is a Dockerfile?**

**Answer:**
"A Dockerfile is a text file with instructions to build a Docker image. It contains commands like FROM (base image), COPY (copy files), RUN (execute commands), and CMD (default command)."

### **4. What is Docker Compose?**

**Answer:**
"Docker Compose is a tool to define and run multi-container applications. Instead of running multiple docker run commands, you define all services in a YAML file and manage them together."

### **5. What are Docker volumes?**

**Answer:**
"Volumes persist data outside containers. Since containers are ephemeral, volumes ensure data survives container removal. Types include named volumes (managed by Docker) and bind mounts (direct path mapping)."

### **6. How do containers communicate?**

**Answer:**
"Containers communicate through Docker networks. Containers on the same network can reach each other by service name. Docker Compose automatically creates a network for services."

### **7. What is the difference between CMD and RUN?**

**Answer:**
"RUN executes commands during image build (like installing packages). CMD specifies the default command when a container starts (like starting the application)."

### **8. What are multi-stage builds?**

**Answer:**
"Multi-stage builds use multiple FROM statements to create smaller final images. You build in one stage and copy only necessary files to the final stage, excluding build tools and dependencies."

### **9. How do you optimize Docker images?**

**Answer:**
"Optimization strategies:
- Use specific tags (not 'latest')
- Use .dockerignore to exclude files
- Order Dockerfile instructions (frequently changing last)
- Use multi-stage builds
- Use smaller base images (Alpine Linux)
- Combine RUN commands to reduce layers"

### **10. What is the difference between COPY and ADD?**

**Answer:**
"COPY copies files from host to image. ADD does the same but also supports URLs and automatic extraction of tar files. COPY is preferred for clarity and predictability."

---

## 🎯 **Real-World Example (Your Project):**

### **Your docker-compose.production.yml:**

```yaml
services:
  postgres:        # Database service
    image: postgres:15-alpine
    # Creates container from postgres image
    
  backend:         # API service
    build: ./backend
    # Builds image from Dockerfile, then creates container
    
  frontend:        # Frontend service
    build: ./frontend
    # Builds image from Dockerfile, then creates container
```

**What happens:**
1. **Build phase:** Creates images from Dockerfiles
2. **Run phase:** Creates containers from images
3. **Network:** All containers can communicate
4. **Volumes:** Data persists in postgres_data

---

## 📚 **Key Takeaways:**

1. **Image** = Template/Blueprint (read-only)
2. **Container** = Running instance (read-write)
3. **Dockerfile** = Instructions to build image
4. **Docker Compose** = Orchestrate multiple containers
5. **Volumes** = Persistent data storage
6. **Networks** = Container communication

---

## 🚀 **Practice Questions:**

1. Explain Docker in one sentence.
2. What happens when you run `docker run -d nginx`?
3. How do you share data between containers?
4. What's the difference between `docker build` and `docker run`?
5. Why use Docker Compose instead of multiple `docker run` commands?

---

**You're now ready for Docker interviews!** 🎉


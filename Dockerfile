# Use an official Node runtime as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /client

# Copy package.json and yarn.lock
COPY package*.json yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Copy the rest of the application code
COPY . .

# Build the React app
RUN yarn build

# Use nginx to serve the build
FROM nginx:alpine
COPY --from=0 /client/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
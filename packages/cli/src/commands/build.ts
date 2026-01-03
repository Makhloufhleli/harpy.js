import chalk from "chalk";
import * as path from "path";

interface BuildOptions {
  target?: "bun" | "vercel" | "cloudflare" | "aws";
  minify?: boolean;
}

const HARPY_DIR = ".harpy";
const STATIC_DIR = ".harpy/static";
const SERVER_DIR = ".harpy/server";
const PUBLIC_DIR = ".harpy/public";

/**
 * Build the Harpy application for production
 */
export async function buildCommand(options: BuildOptions = {}) {
  const cwd = process.cwd();
  const target = options.target || "bun";
  const shouldMinify = options.minify !== false;
  
  // Check if we're in a Harpy project
  const packageJsonPath = path.join(cwd, "package.json");
  const packageJsonFile = Bun.file(packageJsonPath);
  
  if (!(await packageJsonFile.exists())) {
    console.error(chalk.red("✖ No package.json found. Are you in a Harpy project?"));
    process.exit(1);
  }

  const packageJson = await packageJsonFile.json();
  if (!packageJson.dependencies?.["@harpy-js/core"]) {
    console.error(chalk.red("✖ This doesn't appear to be a Harpy project."));
    process.exit(1);
  }

  console.log("");
  console.log(chalk.hex("#f97316")("🦅 Harpy.js") + chalk.gray(" Production Build"));
  console.log(chalk.gray(`   Target: ${target}`));
  console.log("");

  const startTime = Date.now();

  // Clean and create .harpy directory structure
  const harpyDir = path.join(cwd, HARPY_DIR);
  const staticDir = path.join(cwd, STATIC_DIR);
  const serverDir = path.join(cwd, SERVER_DIR);
  const publicDir = path.join(cwd, PUBLIC_DIR);
  
  await Bun.$`rm -rf ${harpyDir}`.quiet();
  await Bun.$`mkdir -p ${staticDir} ${serverDir} ${publicDir}`.quiet();

  // Step 1: Build CSS to .harpy/static
  const globalCssPath = path.join(cwd, "src/assets/global.css");
  const globalCssFile = Bun.file(globalCssPath);
  
  if (await globalCssFile.exists()) {
    const cssStartTime = Date.now();
    console.log(chalk.cyan("⚡") + " Building Tailwind CSS...");
    
    try {
      const cssOutputPath = path.join(staticDir, "styles.css");
      await Bun.$`bunx @tailwindcss/cli -i ${globalCssPath} -o ${cssOutputPath} --minify`.quiet().cwd(cwd);
      const cssDuration = Date.now() - cssStartTime;
      console.log(chalk.green("✓") + ` CSS built in ${chalk.cyan(cssDuration + "ms")} → ${chalk.gray(STATIC_DIR + "/styles.css")}`);
    } catch (error) {
      console.log(chalk.yellow("⚠") + " CSS build failed, continuing...");
    }
  }

  // Step 2: Build hydration chunks for client components
  const hydrationStartTime = Date.now();
  console.log(chalk.cyan("⚡") + " Building hydration chunks...");
  
  try {
    const hydrationScript = path.join(cwd, "node_modules/@harpy-js/core/scripts/build-hydration.ts");
    await Bun.$`bun ${hydrationScript}`.quiet().cwd(cwd);
    const hydrationDuration = Date.now() - hydrationStartTime;
    console.log(chalk.green("✓") + ` Hydration chunks built in ${chalk.cyan(hydrationDuration + "ms")}`);
  } catch (error) {
    console.log(chalk.yellow("⚠") + " No client components found or hydration build failed");
  }

  // Step 3: Build the application with Bun
  const appStartTime = Date.now();
  console.log(chalk.cyan("📦") + " Building server bundle...");
  
  const mainPath = path.join(cwd, "src/main.ts");
  const mainFile = Bun.file(mainPath);
  
  if (!(await mainFile.exists())) {
    console.error(chalk.red("✖ No src/main.ts found."));
    process.exit(1);
  }

  try {
    const minifyFlag = shouldMinify ? "--minify" : "";
    await Bun.$`bun build src/main.ts --outdir=${serverDir} --target=bun ${minifyFlag}`.quiet().cwd(cwd);
    const appDuration = Date.now() - appStartTime;
    console.log(chalk.green("✓") + ` Server built in ${chalk.cyan(appDuration + "ms")} → ${chalk.gray(SERVER_DIR + "/main.js")}`);
  } catch (error) {
    console.error(chalk.red("✖ Build failed:"), error);
    process.exit(1);
  }

  // Step 3: Copy user's public assets to .harpy/public
  const userPublicDir = path.join(cwd, "public");
  const userPublicDirFile = Bun.file(userPublicDir);
  
  try {
    const glob = new Bun.Glob("*");
    const files = [...glob.scanSync({ cwd: userPublicDir })];
    
    if (files.length > 0) {
      const copyStartTime = Date.now();
      console.log(chalk.cyan("📁") + " Copying public assets...");
      
      for (const file of files) {
        // Skip styles.css from public (we build it to .harpy/static)
        if (file === "styles.css") continue;
        const src = path.join(userPublicDir, file);
        const dest = path.join(publicDir, file);
        await Bun.$`cp -r ${src} ${dest}`.quiet();
      }
      
      const copyDuration = Date.now() - copyStartTime;
      console.log(chalk.green("✓") + ` Assets copied in ${chalk.cyan(copyDuration + "ms")} → ${chalk.gray(PUBLIC_DIR)}`);
    }
  } catch {
    // No public directory or empty, skip
  }

  // Step 4: Generate serverless config based on target
  if (target !== "bun") {
    await generateServerlessConfig(cwd, target, packageJson.name || "harpy-app");
  }

  const totalDuration = Date.now() - startTime;
  const seconds = (totalDuration / 1000).toFixed(2);
  console.log("");
  console.log(chalk.green("✓") + ` Build completed in ${chalk.cyan(seconds + "s")}`);
  console.log("");
  
  // Show deployment instructions
  printDeploymentInstructions(target);
}

/**
 * Generate serverless deployment configuration
 */
async function generateServerlessConfig(
  cwd: string, 
  target: "vercel" | "cloudflare" | "aws",
  appName: string
): Promise<void> {
  const configStartTime = Date.now();
  console.log(chalk.cyan("⚙️") + ` Generating ${target} configuration...`);
  
  const harpyDir = path.join(cwd, HARPY_DIR);
  
  switch (target) {
    case "vercel":
      await generateVercelConfig(cwd, harpyDir);
      break;
    case "cloudflare":
      await generateCloudflareConfig(cwd, harpyDir, appName);
      break;
    case "aws":
      await generateAwsConfig(cwd, harpyDir, appName);
      break;
  }
  
  const configDuration = Date.now() - configStartTime;
  console.log(chalk.green("✓") + ` Config generated in ${chalk.cyan(configDuration + "ms")}`);
}

/**
 * Generate Vercel configuration
 */
async function generateVercelConfig(cwd: string, harpyDir: string): Promise<void> {
  // vercel.json for the project root
  const vercelConfig = {
    version: 2,
    buildCommand: "harpy build --target=vercel",
    outputDirectory: ".harpy",
    functions: {
      ".harpy/server/main.js": {
        runtime: "vercel-bun@1.0.0",
        memory: 512,
        maxDuration: 30,
      },
    },
    routes: [
      // Serve static assets from .harpy/static
      {
        src: "/_harpy/(.*)",
        dest: ".harpy/static/$1",
      },
      // Serve user public assets
      {
        src: "/public/(.*)",
        dest: ".harpy/public/$1",
      },
      // All other routes go to the server
      {
        src: "/(.*)",
        dest: ".harpy/server/main.js",
      },
    ],
  };
  
  await Bun.write(path.join(cwd, "vercel.json"), JSON.stringify(vercelConfig, null, 2));
}

/**
 * Generate Cloudflare Workers configuration
 */
async function generateCloudflareConfig(cwd: string, harpyDir: string, appName: string): Promise<void> {
  // wrangler.toml
  const wranglerConfig = `name = "${appName}"
main = ".harpy/server/main.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[site]
bucket = ".harpy/static"

# Static asset routes
[[rules]]
type = "ESModule"
globs = ["**/*.js"]

[assets]
directory = ".harpy/static"
binding = "ASSETS"
`;
  
  await Bun.write(path.join(cwd, "wrangler.toml"), wranglerConfig);
  
  // Create a Cloudflare-compatible entry point
  const cfEntryPoint = `
// Cloudflare Workers entry point
import { createServer } from './main.js';

export default {
  async fetch(request, env, ctx) {
    // Serve static assets
    const url = new URL(request.url);
    if (url.pathname.startsWith('/_harpy/')) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    }
    
    // Handle via Harpy server
    return createServer(request, env);
  },
};
`;
  
  await Bun.write(path.join(harpyDir, "server/worker.js"), cfEntryPoint);
}

/**
 * Generate AWS Lambda configuration
 */
async function generateAwsConfig(cwd: string, harpyDir: string, appName: string): Promise<void> {
  // AWS SAM template
  const samTemplate = `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: ${appName} - Harpy.js Application

Globals:
  Function:
    Timeout: 30
    MemorySize: 512

Resources:
  HarpyFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: handler.handler
      Runtime: provided.al2023
      CodeUri: .harpy/server/
      Events:
        Api:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: ANY
        Root:
          Type: Api
          Properties:
            Path: /
            Method: ANY

  StaticBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub "\${AWS::StackName}-static"
      PublicAccessBlockConfiguration:
        BlockPublicAcls: false
      WebsiteConfiguration:
        IndexDocument: index.html

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint URL
    Value: !Sub "https://\${ServerlessRestApi}.execute-api.\${AWS::Region}.amazonaws.com/Prod/"
  StaticBucketName:
    Description: Static assets S3 bucket
    Value: !Ref StaticBucket
`;
  
  await Bun.write(path.join(cwd, "template.yaml"), samTemplate);
  
  // Lambda handler wrapper
  const lambdaHandler = `
// AWS Lambda handler for Harpy.js
const { handler: bunHandler } = require('./main.js');

exports.handler = async (event, context) => {
  // Convert API Gateway event to Fetch Request
  const url = \`https://\${event.requestContext.domainName}\${event.rawPath || event.path}\`;
  const request = new Request(url, {
    method: event.requestContext.http?.method || event.httpMethod,
    headers: event.headers,
    body: event.body ? event.body : undefined,
  });

  // Call Harpy handler
  const response = await bunHandler(request);

  // Convert Fetch Response to API Gateway response
  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers),
    body: await response.text(),
    isBase64Encoded: false,
  };
};
`;
  
  await Bun.write(path.join(harpyDir, "server/handler.js"), lambdaHandler);
}

/**
 * Print deployment instructions
 */
function printDeploymentInstructions(target: string): void {
  console.log(chalk.bold("Deployment:"));
  console.log("");
  
  switch (target) {
    case "bun":
      console.log("  To start the production server:");
      console.log(chalk.cyan("  $ harpy start"));
      break;
    case "vercel":
      console.log("  Deploy to Vercel:");
      console.log(chalk.cyan("  $ vercel"));
      console.log("");
      console.log(chalk.gray("  Or connect your Git repository at vercel.com"));
      break;
    case "cloudflare":
      console.log("  Deploy to Cloudflare Workers:");
      console.log(chalk.cyan("  $ wrangler deploy"));
      break;
    case "aws":
      console.log("  Deploy to AWS Lambda:");
      console.log(chalk.cyan("  $ sam build && sam deploy --guided"));
      console.log("");
      console.log("  Upload static assets to S3:");
      console.log(chalk.cyan("  $ aws s3 sync .harpy/static s3://<bucket-name>"));
      break;
  }
  console.log("");
}

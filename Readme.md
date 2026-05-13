# Deployment ThingsBoard and Medplum
Implementation of ThingsBoard and Medplum on docker containers.

## Setup

### 1. First time local setup
1. To run project locally, you have to run initialization script. Use `init.bat` or `init.ps1` for Windows or `init.sh` for Linux/Mac.  
2. Go to `fpl_thingsboard/backend` folder and run `docker compose up` command and wait until containers are running  
3. Navigate to root project folder `/fpl_thingsboard` and run `pnpm install` command to install all dependencies  
4. Copy `fpl_thingsboard/apps/api/.env.example` to `fpl_thingsboard/apps/api/.env` file and fill in the values with your own database url, jwt and refresh jwt secrets, and mailer credentials.  
5. Copy `fpl_thingsboard/apps/front/.env.example` to `fpl_thingsboard/apps/front/.env` file.  
6. Run `pnpm dev` command to start dev server for frontend and backend  
7. Check your ip address using `ipconfig` command (Windows).  
8. Frontend app is running on `{YOUR_IP_ADDRESS}:3000` (ex. `10.0.1.35:3000`) or `localhost:3000` if you are using local machine.  
9. To accept requested users, go to `localhost:3000/dashboard/requestedUsers` and accept them.  
10. OPTIONAL! To check thingsboard, go to `{YOUR_IP_ADDRESS}:8088` (ex. `10.0.1.35:8088`) or `localhost:8088` if you are using local machine. You can find default Thingsboard SYS_ADMIN credentials in `fpl_thingsboard/apps/api/.env.example` file.  
11. To check minio whitelabel files, go to `localhost:9001/login` and log in using username: `admin` and password: `password123`  
12. To login as administrator, go to `localhost:3000/auth/login/admin` and log in using default email: `admin@admin.com` with password: `softteco-password`  


### 2. After first time setup
1. Go to `fpl_thingsboard/backend` folder and run `docker compose up` command and wait until containers are running
2. Go to `fpl_thingsboard` folder and run `pnpm dev` command to start dev server for frontend and backend  


### 3. Setting up ThingsBoard Gateway - OPTIONAL!
If you're using our prepared Docker setup, you can use instructions for Option A.


#### Option A — Newer ThingsBoard (edit token in UI)
1. Open the ThingsBoard UI (`{YOUR_IP_ADDRESS}:8088`) and navigate to: Gateway → Gateway List → select created gateway → `General Configuration`
2. In `Access Token`, paste the value of `GATEWAY_ACCESSTOKEN_ENV` from the `fpl_thingsboard/backend/gateway/.env` file

#### Option B — Older ThingsBoard (cannot edit token in UI)
1. Navigate to the `fpl_thingsboard/backend/gateway` folder
2. Edit the `.env` file and set: `GATEWAY_ACCESSTOKEN_ENV=<Access Token copied earlier from backend>`

#### Apply changes and run
1. Navigate to the `fpl_thingsboard/backend/gateway` folder
2. Run the Gateway using `docker compose up`
3. Wait until the initial configuration is complete
4. The Gateway status should change from “Inactive” to “Active”
5. If you're having any issues, check if you don't have any residual ThingsBoard Gateway data on your machine. If so, you can delete `tb-gw-config`, `tb-gw-logs` and `tb-gw-extensions` volumes and try again

#### Configure MQTT connector
1. Click on created gateway > General Configuration > Logs and enable Remote logs with log level `DEBUG`  
2. Go back and click on Connectors configuration and add new connector (ex. Type: MQTT, Name: MQTT, Logging level: `DEBUG`)  
3. Use Advanced configuration for created connector, go to General section and enable remote logging (make sure to set same log level as in General Configuration)  
4. Now go to Configuration section and copy content of `fpl_thingsboard/backend/gateway/default-connector-config.json` file and paste it here

## Custom Features
This project extends the base ThingsBoard functionality with several custom features designed to enhance security, branding, and healthcare integration.

---

### Google OAuth 2.0
To enable Google login for users, you need to configure OAuth 2.0 settings in the administration panel:
1. Log in as **System Administrator** at `localhost:3000/auth/login/admin` using your credentials.
2. In the sidebar, navigate to **Security** -> **OAuth 2.0**.
3. In the **Domains** tab, click **Add domain** and enter your domain name (e.g., `localhost` for local development).
4. Switch to the **OAuth 2.0 clients** tab and click the **Add** button.
5. Set the **Provider** to `Google` and enter your **Client ID** and **Client Secret** (obtained from the [Google Cloud Console](https://console.cloud.google.com/)).
6. Save the configuration. The "Login with Google" button should now appear on the standard user login page (`localhost:3000/auth/login`).

---

### Whitelabeling (MinIO)
The platform allows you to customize the appearance (logos and colors) at both global and tenant levels. These assets are stored in **MinIO**.

#### Global Whitelabeling
Global settings are used as a fallback if a tenant has not configured their own branding:
1. Log in as **System Administrator** at `localhost:3000/auth/login/admin`.
2. In the sidebar, navigate to **Settings**.
3. In the **General** tab, scroll down to the **Global Whitelabel** section.
4. Upload your logos for both **Light Mode** and **Dark Mode** (PNG or SVG recommended).
5. (Optional) Upload a `light-colors.css` file to customize the platform's color scheme.
6. Click **Upload Images** or **Upload CSS** to apply changes.

#### Tenant-specific Whitelabeling
You can override global branding for specific tenants:
1. Log in as **System Administrator**.
2. Navigate to **Tenants** in the sidebar.
3. Click on the desired tenant in the list to open their details panel.
4. Switch to the **Whitelabel** tab.
5. Upload the specific logos for that tenant and click **Upload**.

> [!NOTE]
> All uploaded whitelabel assets are stored in the `public-assets` bucket in MinIO. You can manage these files directly at `localhost:9001/login` using the credentials provided in the `.env` file.

---

### Medplum Integration (Addon)
Medplum is an open-source healthcare platform for managing FHIR resources. Enabling this integration adds healthcare-specific capabilities to the platform.

#### Enabling Medplum
To activate the integration for a specific tenant:
1. Log in as **System Administrator** at `localhost:3000/auth/login/admin`.
2. Navigate to **Tenants** in the sidebar.
3. Select a tenant and open the **Medplum** tab in their details panel.
4. Toggle **Medplum Integration**. 
   > [!IMPORTANT]
   > This action is irreversible. It creates a dedicated project and administrative context for the tenant in the Medplum server.

#### Features
Once enabled for a tenant, the sidebar for users belonging to that tenant (and for admins impersonating them) will include new items providing access to:
- **Patients**: Manage healthcare patient records.
- **Practitioners**: Manage medical staff and practitioners.
- **Devices**: Create devices and assign a patient to those devices.

#### Default Rule Chain (Medplum Automation)
When a tenant is created, a dedicated **Base Rule Chain** is automatically configured to handle medical data automation and integration with Medplum.

**Key capabilities:**
- It checks each telemetry request that happens inside thingsboard.
- The rulechain checks if the telementry request contains the data that was previously set by user (when creating new device - by setting custom attributes - named (`limits`) and (`telemetry_keys`) ).
- If any value exceeds the defined medical thresholds (e.g., blood pressure or heart rate limits), it is flagged as "abnormal".
- All abnormal data is automatically pushed to the Medplum server to create new **Observation** resources, ensuring a persistent medical record of any health alerts.
- All observations are available to be displayed in patients profile.

---

### MLLP Server (HL7 Integration)
The `mllp-server` acts as a bridge between healthcare data sources (using the HL7 v2 protocol over MLLP) and our backend. It receives raw HL7 messages and forwards them to the API for conversion into FHIR resources.

#### 1. MLLP Server Setup
1. Navigate to the `mllp-server` directory.
2. Copy `.env.example` to `.env` and set the `TENANT_ID` (the destination tenant for incoming data).
3. Install dependencies: `npm install`.
4. Start the server: `node server.js`.

By default, the server listens on `localhost:56000`.

#### 2. Simulating HL7 Data (SimHospital)
To test the integration with simulated patient data, you can use [SimHospital](https://github.com/google/simhospital):

1. **Build the simulator**:
   ```bash
   go build -o simulator.exe ./cmd/simulator
   ```

2. **Run the simulation** (pointing to our MLLP server):
   ```bash
   .\simulator.exe -output=mllp -mllp_destination="localhost:56000" -pathways_per_hour=600 -local_path="C:\path\to\simhospital\data"
   ```

#### 3. From Hospital Data to Medical Records (HL7 to FHIR)
Our system does more than just store raw HL7 logs; it actively "translates" legacy hospital data into modern medical records. When a message arrives from a source like SimHospital, the backend translates HL7 message containing PID and PV1 segments into FHIR resources.

For instance, it looks into the **Patient Identity (PID)** to extract personal details and identifiers. It's smart enough to recognize if a patient already exists in Medplum to avoid duplicates, and it can even handle the complex task of merging records if the hospital system says they are the same person. Beyond just identity, we capture the **Clinical Context (PV1)**—the "story" of the visit—including when they were admitted, which doctor is looking after them, and exactly where in the hospital they are located.

#### Data Flow & Processing
Here is the step-by-step journey of a medical record through the system:

1. **SimHospital** (Data Source)  
   - Sends raw HL7 v2 message via MLLP protocol to port `56000`.

2. **mllp-server/server.js** (Bridge)  
   - Listens for the MLLP message and forwards it as a JSON payload to the backend API.

3. **apps/api/src/hl7/interface/rest/hl7.controller.ts** (API Entry)  
   - Receives the message at the `/public-api/hl7-decode` endpoint and initiates the processing queue.

4. **apps/api/src/hl7/interface/pipes/hl7-to-fhir-pipe.ts** (The Translator)  
   - The core logic that parses the HL7 string into a structured object using the `@medplum/core` library.

5. **apps/api/src/hl7/application/use-cases/create-patient-pid.use-case.ts** (Patient Logic)  
   - Extracts data from the **PID** segment to create, update, or merge a **Patient** resource.

6. **apps/api/src/hl7/application/use-cases/create-encounter-pv1.use-case.ts** (Visit Logic)  
   - Extracts data from the **PV1** segment to create an **Encounter** (visit) and link it to the patient and practitioner.

7. **Medplum Server** (Final Destination)  
   - The resulting FHIR resources are saved in the Medplum database and become visible in the UI.








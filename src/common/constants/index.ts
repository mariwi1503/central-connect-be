import { config } from 'dotenv';

config(); // initiate config

export const corsWhitelist = [
  'https://centralconnect.id',
  'https://api.centralconnect.id',
  'https://dev-dashboard.centralconnect.id',
  'http://localhost:3000',
  'http://localhost:4173',
  'https://central-batam-prod.s3.ap-southeast-1.amazonaws.com',
  'https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--3000--365214aa.local-credentialless.webcontainer-api.io',
  'https://central-connect-admi-cy94.bolt.host',
];

export const jwtConstant = {
  secret: process.env.ACCESS_TOKEN_SECRET,
};

export const roleAccess = [
  {
    key: 'approver',
    label: 'Approver',
  },
  {
    key: 'verificator',
    label: 'Verificator',
  },
  {
    key: 'emergency_responder',
    label: 'Emergency Responder',
  },
  {
    key: 'create',
    label: 'Create',
  },
  {
    key: 'read',
    label: 'Read',
  },
  {
    key: 'update',
    label: 'Update',
  },
  {
    key: 'delete',
    label: 'Delete',
  },
  {
    key: 'excel_downloader',
    label: 'Excel Downloader',
  },
];

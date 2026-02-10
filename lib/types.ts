export interface Endpoint {
  ID: string;
  HOSTNAME: string;
  HASH: string;
  SO: string;
  VERSION: string;
  endpointUpdatedAt: string;
}

export interface VulnerabilityIncident {
  assetid: string;
  asset: string;
  cve: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | string;
  eventType: string;
  publisher: string;
  apporso: string;
  threatLevelId: number;
  vulV3exploitlevel: number;
  vulv3basescore: number;
  patchId: string;
  vulsummary: string;
  eventcreatedat: string;
  eventupdatedat: string;
  MitigatedEventDetectionDate: string | number;
}

export interface Mitigation {
  assetid: string;
  asset: string;
  cve: string;
  severity: string;
  eventType: string;
  mitigation_date: string;
  detection_date: string;
  mitigation_time: number;
}

export interface EndpointTask {
  Taskid: string;
  AutomationId: string;
  AutomationName: string;
  Asset: string;
  TaskType: string;
  ActionStatus: string;
  MessageStatus: string;
  CreateAt: string;
  UpdateAt: string;
}

export interface EndpointGroup {
    groupname: string;
    assets: string; // pipe separated, e.g., "Asset1|Asset2|"
}

/**
 * Main State Interface
 */
export interface DashboardData {
    endpoints: Endpoint[];
    vulnerabilities: VulnerabilityIncident[];
    mitigations: Mitigation[];
    tasks: EndpointTask[];
    groups: EndpointGroup[];
    // Track loading state or errors if needed, but usually strictly data here
}

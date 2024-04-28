import { WebsitePage } from "./WebsitePage";
export interface Website {
    id?: string;
    url: string;
    monitoringStatus: string;
    registrationDate: Date;
    lastEvaluationDate?: Date;
    pages: WebsitePage[];
}


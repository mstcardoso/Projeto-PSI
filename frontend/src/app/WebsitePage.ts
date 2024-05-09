export interface  WebsitePage {
    id: string;
    url: string;
    lastEvaluationDate?: Date;
    monitoringStatus: string;
    errors?: boolean[];
}
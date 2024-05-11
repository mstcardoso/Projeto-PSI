export interface  WebsitePage {
    page: { [k: string]: any; };
    id: string;
    url: string;
    lastEvaluationDate?: Date;
    monitoringStatus: string;
    errorTypes?: boolean[];
    commonErrors?: Map<string, string>;
}
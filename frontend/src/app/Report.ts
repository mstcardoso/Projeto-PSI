import { ActRules } from "./ActRules";
import { Wcag } from "./Wcag";

export interface Report {
    act: ActRules;
    wcag: Wcag;
}
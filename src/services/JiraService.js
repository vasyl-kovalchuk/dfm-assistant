const JiraApi = require("jira").JiraApi;
const util = require("util");

const DEFAULT_PROJECT = "WMO";
const DEFAULT_LABEL = "LNO";

const JIRA_ISSUES_FILTER = "project = %s AND issuetype in standardIssueTypes() AND status in (Resolved, Closed, \"In Review\") AND labels = %s AND Sprint = %s"

class JiraService {

    constructor() {
        this.jiraApi = new JiraApi(
            "https",
            "lvserv01.logivations.com",
            443,
            process.env.JIRA_USER_NAME,
            process.env.JIRA_PASSWORD,
            "latest"
        );
    }

    getActiveSprintVersion() {
        return new Promise((resolve) => {
            resolve("7.11")
        });
    }

    findDFMIssues(fixVersion) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.jiraApi.searchJira(util.format(JIRA_ISSUES_FILTER, DEFAULT_PROJECT, DEFAULT_LABEL, fixVersion),
                ["summary", "status", "assignee", "description", "changelog"], function (error, response) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(response.issues.map(issue=>({
                            id: issue.id,
                            key: issue.key,
                            title_link: `https://lvserv01.logivations.com/browse/${issue.key}`,
                            summary: issue.fields.summary,
                            developer: issue.fields.assignee.displayName
                        })));
                    }
                })
        });
    }

    getAllVersions() {
        return new Promise((resolve, reject) => {
            this.jiraApi.getVersions(DEFAULT_PROJECT, function (error, versions) {
                if (error) {
                    reject(error)
                } else {
                    resolve(versions.slice(Math.max(versions.length - 7, 1)))
                }
            })
        });
    }
}

module.exports = JiraService;
package org.domeos.framework.api.model.global;

import org.domeos.util.StringUtils;
import org.domeos.util.CommonUtil;

/**
 * Created by feiliu206363 on 2015/12/22.
 */
public class ClusterMonitor {

    private int id;
    private String transfer;
    private String graph;
    private String query;
    private String hbs;
    private String judge;
    private String alarm;
    private String sender;
    private String nodata;
    private String redis;
    private String apiMail;
    private String apiSms;
    private long createTime;
    private long lastUpdate;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public String getTransfer() {
        return transfer;
    }

    public void setTransfer(String transfer) {
        this.transfer = transfer;
    }

    public String getGraph() {
        return graph;
    }

    public void setGraph(String graph) {
        this.graph = graph;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getHbs() {
        return hbs;
    }

    public void setHbs(String hbs) {
        this.hbs = hbs;
    }

    public String getJudge() {
        return judge;
    }

    public void setJudge(String judge) {
        this.judge = judge;
    }

    public String getAlarm() {
        return alarm;
    }

    public void setAlarm(String alarm) {
        this.alarm = alarm;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getNodata() {
        return nodata;
    }

    public void setNodata(String nodata) {
        this.nodata = nodata;
    }

    public String getRedis() {
        return redis;
    }

    public void setRedis(String redis) {
        this.redis = redis;
    }

    public String getApiMail() {
        return apiMail;
    }

    public void setApiMail(String apiMail) {
        this.apiMail = apiMail;
    }

    public String getApiSms() {
        return apiSms;
    }

    public void setApiSms(String apiSms) {
        this.apiSms = apiSms;
    }

    public long getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(long lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    public String checkLegality() {
        if (!StringUtils.isBlank(transfer)) {
            String[] transferUrls = transfer.split(",");
            StringBuilder builder = new StringBuilder();
            for(String url : transferUrls) {
                builder.append(CommonUtil.domainUrl(url)).append(",");
            }
            transfer = builder.toString().substring(0, builder.length() - 1);
        }
        if (!StringUtils.isBlank(query)) {
            String[] queryUrls = query.split(",");
            StringBuilder builder = new StringBuilder();
            for(String url : queryUrls) {
                builder.append(CommonUtil.domainUrl(url)).append(",");
            }
            query = builder.toString().substring(0, builder.length() - 1);
        }
        if (!StringUtils.isBlank(graph)) {
            String[] graphUrls = graph.split(",");
            StringBuilder builder = new StringBuilder();
            for(String url : graphUrls) {
                builder.append(CommonUtil.domainUrl(url)).append(",");
            }
            graph = builder.toString().substring(0, builder.length() - 1);
        }
        if (!StringUtils.isBlank(hbs)) {
            graph = CommonUtil.domainUrl(hbs);
        }
        if (!StringUtils.isBlank(judge)) {
            String[] judgeUrls = judge.split(",");
            StringBuilder builder = new StringBuilder();
            for(String url : judgeUrls) {
                builder.append(CommonUtil.domainUrl(url)).append(",");
            }
            judge = builder.toString().substring(0, builder.length() - 1);
        }
        if (!StringUtils.isBlank(alarm)) {
            alarm = CommonUtil.domainUrl(alarm);
        }
        if (!StringUtils.isBlank(sender)) {
            sender = CommonUtil.domainUrl(sender);
        }
        if (!StringUtils.isBlank(nodata)) {
            nodata = CommonUtil.domainUrl(nodata);
        }
        if (!StringUtils.isBlank(redis)) {
            redis = CommonUtil.domainUrl(redis);
        }

        return null;
    }
}

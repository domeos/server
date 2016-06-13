package org.domeos.framework.api.model.global;

import org.apache.commons.lang3.StringUtils;
import org.domeos.util.CommonUtil;

/**
 * Created by feiliu206363 on 2015/12/22.
 */
public class ClusterMonitor {

    private int id;
    private String transfer;
    private String graph;
    private String query;
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
        return null;
    }
}

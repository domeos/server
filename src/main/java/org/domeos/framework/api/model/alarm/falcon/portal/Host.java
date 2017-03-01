package org.domeos.framework.api.model.alarm.falcon.portal;

import java.sql.Timestamp;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class Host {

    // host

    private long id;
    private String hostname = "";
    private String ip = "";
    private String agent_version = "";
    private String plugin_version = "";
    private long maintain_begin = 0;
    private long maintain_end = 0;
    private Timestamp update_at = new Timestamp(System.currentTimeMillis());

    public Host() {
    }

    public Host(long id) {
        this.id = id;
    }

    public Host(long id, String hostname, String ip, String agent_version, String plugin_version, long maintain_begin, long maintain_end, Timestamp update_at) {
        this.id = id;
        this.hostname = hostname;
        this.ip = ip;
        this.agent_version = agent_version;
        this.plugin_version = plugin_version;
        this.maintain_begin = maintain_begin;
        this.maintain_end = maintain_end;
        this.update_at = update_at;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getAgent_version() {
        return agent_version;
    }

    public void setAgent_version(String agent_version) {
        this.agent_version = agent_version;
    }

    public String getPlugin_version() {
        return plugin_version;
    }

    public void setPlugin_version(String plugin_version) {
        this.plugin_version = plugin_version;
    }

    public long getMaintain_begin() {
        return maintain_begin;
    }

    public void setMaintain_begin(long maintain_begin) {
        this.maintain_begin = maintain_begin;
    }

    public long getMaintain_end() {
        return maintain_end;
    }

    public void setMaintain_end(long maintain_end) {
        this.maintain_end = maintain_end;
    }

    public Timestamp getUpdate_at() {
        return update_at;
    }

    public void setUpdate_at(Timestamp update_at) {
        this.update_at = update_at;
    }
}

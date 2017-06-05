package org.domeos.framework.api.consolemodel.configuration;

import org.domeos.framework.api.consolemodel.auth.CreatorInfo;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.configuration.ConfigurationCollection;

import java.util.Comparator;

/**
 * Created by feiliu206363 on 2017/1/19.
 */
public class ConfigurationCollectionInfo {
    private CreatorInfo creatorInfo;
    private int id;
    private String name;
    private String description;
    private long createTime;
    private Role role;
    private int configurationCount = 0;
    private int memberCount = 0;

    public CreatorInfo getCreatorInfo() {
        return creatorInfo;
    }

    public ConfigurationCollectionInfo setCreatorInfo(CreatorInfo creatorInfo) {
        this.creatorInfo = creatorInfo;
        return this;
    }

    public int getId() {
        return id;
    }

    public ConfigurationCollectionInfo setId(int id) {
        this.id = id;
        return this;
    }

    public String getName() {
        return name;
    }

    public ConfigurationCollectionInfo setName(String name) {
        this.name = name;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public ConfigurationCollectionInfo setDescription(String description) {
        this.description = description;
        return this;
    }

    public long getCreateTime() {
        return createTime;
    }

    public ConfigurationCollectionInfo setCreateTime(long createTime) {
        this.createTime = createTime;
        return this;
    }

    public Role getRole() {
        return role;
    }

    public ConfigurationCollectionInfo setRole(Role role) {
        this.role = role;
        return this;
    }

    public int getConfigurationCount() {
        return configurationCount;
    }

    public ConfigurationCollectionInfo setConfigurationCount(int configurationCount) {
        this.configurationCount = configurationCount;
        return this;
    }

    public int getMemberCount() {
        return memberCount;
    }

    public ConfigurationCollectionInfo setMemberCount(int memberCount) {
        this.memberCount = memberCount;
        return this;
    }

    public ConfigurationCollectionInfo buildByCollection(ConfigurationCollection collection) {
        ConfigurationCollectionInfo collectionInfo = new ConfigurationCollectionInfo();
        collectionInfo.setId(collection.getId());
        collectionInfo.setName(collection.getName());
        collectionInfo.setDescription(collection.getDescription());
        collectionInfo.setCreateTime(collection.getCreateTime());
        return collectionInfo;
    }

    public static class ConfigurationCollectionListComparator implements Comparator<ConfigurationCollectionInfo> {
        @Override
        public int compare(ConfigurationCollectionInfo t1, ConfigurationCollectionInfo t2) {
            if (t2.getCreateTime() - t1.getCreateTime() > 0) {
                return 1;
            } else if (t2.getCreateTime() - t1.getCreateTime() < 0) {
                return -1;
            } else {
                return 0;
            }
        }
    }
}

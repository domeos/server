package org.domeos.framework.api.biz.project.impl;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.project.ProjectCollectionBiz;
import org.domeos.framework.api.mapper.project.ProjectCollectionMapper;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.project.ProjectCollection;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.exception.DaoConvertingException;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Created by feiliu206363 on 2016/9/22.
 */
@Service("projectCollectionBiz")
public class ProjectCollectionBizImpl extends BaseBizImpl implements ProjectCollectionBiz {
    @Autowired
    ProjectCollectionMapper projectCollectionMapper;

    @Autowired
    BaseBiz baseBiz;

    public List<ProjectCollection> getPrivateProjectCollection(List<CollectionAuthorityMap> collectionAuthorityMapList) {
        List<ProjectCollection> collections = new ArrayList<>();
        if (collectionAuthorityMapList != null) {
            for (CollectionAuthorityMap tmp : collectionAuthorityMapList) {
                ProjectCollection projectCollection = getById(PROJECT_COLLECTION, tmp.getCollectionId(), ProjectCollection.class);
                if (projectCollection != null) {
                    collections.add(projectCollection);
                }
            }
        }
        return collections;
    }

    public List<ProjectCollection> getPublicProjectCollection() {
        List<RowMapperDao> collections = projectCollectionMapper.getPublicProjectCollection(ProjectCollection.ProjectCollectionState.PUBLIC);
        List<ProjectCollection> projectCollections = new ArrayList<>();
        if (collections != null) {
            for (RowMapperDao tmp : collections) {
                ProjectCollection projectCollection = checkResult(tmp, ProjectCollection.class);
                projectCollections.add(projectCollection);
            }
        }
        return projectCollections;
    }

    @Override
    public void addProjectCollection(ProjectCollection projectCollection) {
        projectCollectionMapper.addProjectCollection(projectCollection, projectCollection.toString());
    }

    @Override
    public ProjectCollection getProjectCollectionByName(String name) {
        RowMapperDao data = projectCollectionMapper.getProjectCollectionByName(name);
        return checkResult(data, ProjectCollection.class);
    }

    @Override
    public void updateProjectCollection(ProjectCollection projectCollection) {
        projectCollectionMapper.updateProjectCollection(projectCollection, projectCollection.toString());
    }

    @Override
    public void deleteProjectCollection(int id) {
        removeById(PROJECT_COLLECTION, id);
    }

    @Override
    public boolean checkProjectCollectionName(String name) {
        // true for check pass, false for check fail
        int count = projectCollectionMapper.checkProjectCollectionName(name);
        return count == 0;
    }

    public Set<ProjectCollection> getCurrentUserProjectCollectionSet(int userId) {
        List<CollectionAuthorityMap> collectionList = AuthUtil.getCollectionList(userId, ResourceType.PROJECT_COLLECTION);
        List<ProjectCollection> privateCollection = getPrivateProjectCollection(collectionList);
        List<ProjectCollection> publicCollection = getPublicProjectCollection();
        Set<ProjectCollection> collectionSet = new HashSet<>();
        if (privateCollection != null) {
            collectionSet.addAll(privateCollection);
        }
        if (publicCollection != null) {
            collectionSet.addAll(publicCollection);
        }
        return collectionSet;
    }

    public Map<String, ProjectCollection> getCurrentUserProjectCollectionMap(int userId) {
        List<CollectionAuthorityMap> collectionList = AuthUtil.getCollectionList(userId, ResourceType.PROJECT_COLLECTION);
        List<ProjectCollection> privateCollection = getPrivateProjectCollection(collectionList);
        List<ProjectCollection> publicCollection = getPublicProjectCollection();
        Map<String, ProjectCollection> collectionMap = new HashMap<>();
        if (privateCollection != null) {
            for (ProjectCollection tmp : privateCollection) {
                collectionMap.put(tmp.getName(), tmp);
            }
        }
        if (publicCollection != null) {
            for (ProjectCollection tmp : publicCollection) {
                collectionMap.put(tmp.getName(), tmp);
            }
        }
        return collectionMap;
    }

    @Override
    public List<ProjectCollection> getProjectCollectionIncludeRemovedByIdList(List<Integer> idList) {
        try {
            if (idList == null || idList.size() == 0) {
                return new ArrayList<>();
            }
            StringBuilder builder = new StringBuilder();
            builder.append(" ( ");
            for (int i = 0; i < idList.size(); i++) {
                builder.append(idList.get(i));
                if (i != idList.size() - 1) {
                    builder.append(" , ");
                }
            }
            builder.append(") ");
            return projectCollectionMapper.getProjectCollectionIncludeRemovedByIdList(builder.toString());
        }catch (Exception e) {
            throw new DaoConvertingException("Get MySQL Data failed! tableName=" + GlobalConstant.PROJECT_COLLECTION_TABLE_NAME
                    + ", resourceList=" + idList, e );
        }
    }

    @Override
    public boolean isAuthorited(int id) {
        ProjectCollection.ProjectCollectionState authority = projectCollectionMapper.getAuthoriy(id);
        return authority != null && authority == ProjectCollection.ProjectCollectionState.PUBLIC;
    }

    @Override
    public List<ProjectCollection> listAllProjectCollections() {
        return baseBiz.getWholeTable(GlobalConstant.PROJECT_COLLECTION_TABLE_NAME, ProjectCollection.class);
    }
}

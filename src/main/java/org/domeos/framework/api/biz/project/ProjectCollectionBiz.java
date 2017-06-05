package org.domeos.framework.api.biz.project;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.project.ProjectCollection;

import java.util.Map;
import java.util.Set;

/**
 * Created by feiliu206363 on 2016/9/22.
 */
public interface ProjectCollectionBiz extends BaseBiz {
    String PROJECT_COLLECTION = "project_collection";

//    List<ProjectCollection> getPrivateProjectCollection(List<CollectionAuthorityMap> collectionAuthorityMapList);
//
//    List<ProjectCollection> getPublicProjectCollection();

    void addProjectCollection(ProjectCollection projectCollection);

    ProjectCollection getProjectCollectionByName(String name);

    void updateProjectCollection(ProjectCollection projectCollection);

    void deleteProjectCollection(int id);

    boolean checkProjectCollectionName(String name);

    Set<ProjectCollection> getCurrentUserProjectCollectionSet(int userId);

    Map<String, ProjectCollection> getCurrentUserProjectCollectionMap(int userId);

    boolean isAuthorited(int id);

}

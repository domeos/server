package org.domeos.framework.engine.coderepo;


import org.domeos.framework.api.mapper.domeos.project.SubversionUserMapper;
import org.domeos.framework.api.model.project.SubversionUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created by kairen on 16-1-13.
 */
@Component
public class SubversionInfo {

    static SubversionUserMapper subversionUserMapper;

    @Autowired
    public void setSubversionMapper(SubversionUserMapper subversionUserMapper) {
        SubversionInfo.subversionUserMapper = subversionUserMapper;
    }

    public static SubversionUser getSubversion(int id) {
        SubversionUser subversion = subversionUserMapper.getSubversionInfoById(id);
        if (subversion != null) {
            return subversion;
        } else {
            return null;
        }
    }

    public static List<SubversionUser> getSubversionsByUserId(int userId) {
        return subversionUserMapper.getSubversionInfoByUserId(userId);
    }
}
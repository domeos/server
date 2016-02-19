package org.domeos.util.code;


import org.domeos.api.mapper.project.SubversionMapper;
import org.domeos.api.model.git.Subversion;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * Created by kairen on 16-1-13.
 */
public class SubversionInfo {

    static SubversionMapper subversionMapper;

    @Autowired
    public void setSubversionMapper(SubversionMapper subversionMapper) {
        SubversionInfo.subversionMapper = subversionMapper;
    }

    public static Subversion getSubversion(int id) {
        Subversion subversion = subversionMapper.getSubversionInfoById(id);
        if (subversion != null) {
            return subversion;
        } else {
            return null;
        }
    }

    public static List<Subversion> getSubversionsByUserId(int userId) {
        return subversionMapper.getSubversionInfoByUserId(userId);
    }
}

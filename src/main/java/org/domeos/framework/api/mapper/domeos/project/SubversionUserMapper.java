package org.domeos.framework.api.mapper.domeos.project;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.project.SubversionUser;

import java.util.List;

/**
 * Created by kairen on 16-1-19.
 */
@Mapper
public interface SubversionUserMapper {
    @Select("SELECT * FROM subversion_user WHERE userId=#{userId}")
    List<SubversionUser> getSubversionInfoByUserId(@Param("userId") int userId);

    @Select("SELECT * FROM subversion_user WHERE id=#{id}")
    SubversionUser getSubversionInfoById(@Param("id") int id);

    @Select("SELECT * FROM subversion_user WHERE id=#{id} and name=#{name}")
    SubversionUser getSubversionInfoByName(@Param("id") int id, @Param("name") String name);

    @Select("SELECT * FROM subversion_user WHERE userId=#{userId} AND name=#{name}")
    SubversionUser getSubversionInfoByUserIdAndName(@Param("userId") int userId, @Param("name") String name);

    @Select("SELECT * FROM subversion_user WHERE userId=#{userId} AND svnPath=#{svnPath}")
    SubversionUser getSubversionInfoByUserIdAndSvnPath(@Param("userId") int userId, @Param(("svnPath")) String svnPath);

    @Insert("INSERT INTO subversion_user (userId, name, password, createTime, svnPath) VALUES (#{userId}, #{name}," +
            " #{password}, #{createTime}, #{svnPath})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addSubversionInfo(SubversionUser subversion);

    @Delete("DELETE FROM subversion_user WHERE id=#{id}")
    int deleteSubversionInfoById(@Param("id") int id);

    @Update("UPDATE subversion_user SET userId=#{userId}, name=#{name}, password=#{password} WHERE id=#{id}")
    int updateSubversionInfoById(SubversionUser subversion);
}

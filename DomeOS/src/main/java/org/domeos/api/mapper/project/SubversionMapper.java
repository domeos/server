package org.domeos.api.mapper.project;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.git.Subversion;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by kairen on 16-1-19.
 */
@Repository
public interface SubversionMapper {
    @Select("SELECT * FROM subversion_info WHERE userId=#{userId}")
    List<Subversion> getSubversionInfoByUserId(@Param("userId") int userId);

    @Select("SELECT * FROM subversion_info WHERE id=#{id}")
    Subversion getSubversionInfoById(@Param("id") int id);

    @Select("SELECT * FROM subversion_info WHERE id=#{id} and name=#{name}")
    Subversion getSubversionInfoByName(@Param("id") int id, @Param("name") String name);

    @Select("SELECT * FROM subversion_info WHERE userId=#{userId} AND name=#{name}")
    Subversion getSubversionInfoByUserIdAndName(@Param("userId") int userId, @Param("name") String name);

    @Select("SELECT * FROM subversion_info WHERE userId=#{userId} AND svnPath=#{svnPath}")
    Subversion getSubversionInfoByUserIdAndSvnPath(@Param("userId") int userId, @Param(("svnPath")) String svnPath);

    @Insert("INSERT INTO subversion_info (userId, name, password, createTime, svnPath) VALUES (#{userId}, #{name}, #{password}, #{createTime}, #{svnPath})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addSubversionInfo(Subversion subversion);

    @Delete("DELETE FROM subversion_info WHERE id=#{id}")
    int deleteSubversionInfoById(@Param("id") int id);

    @Update("UPDATE subversion_info SET userId=#{userId}, name=#{name}, password=#{password} WHERE id=#{id}")
    int updateSubversionInfoById(Subversion subversion);
}

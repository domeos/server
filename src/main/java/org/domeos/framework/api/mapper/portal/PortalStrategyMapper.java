package org.domeos.framework.api.mapper.portal;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.alarm.falcon.portal.Strategy;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/14.
 */
@Mapper
public interface PortalStrategyMapper {
    @Insert("INSERT INTO strategy (metric, tags, max_step, priority, func, op, right_value, note, tpl_id) VALUES (" +
            "#{metric}, #{tags}, #{max_step}, #{priority}, #{func}, #{op}, #{right_value}, #{note}, #{tpl_id})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int insertStrategy(Strategy strategy);

    @Insert("INSERT INTO strategy (id, metric, tags, max_step, priority, func, op, right_value, note, tpl_id) VALUES (" +
            "#{id}, #{metric}, #{tags}, #{max_step}, #{priority}, #{func}, #{op}, #{right_value}, #{note}, #{tpl_id})")
    int insertStrategyById(Strategy strategy);

    @Delete("DELETE FROM strategy WHERE tpl_id=#{tpl_id}")
    int deleteStrategyByTemplateId(@Param("tpl_id") long tpl_id);

    @Delete("DELETE FROM strategy WHERE tags IN (${containerIds})")
    int deleteStrategyByContainerIds(@Param("containerIds") String containerIds);

    @Select("SELECT DISTINCT RIGHT(tags, 64) FROM strategy WHERE tpl_id=#{tpl_id}")
    List<String> getContainerIdByTemplateId(@Param("tpl_id") long tpl_id);
}

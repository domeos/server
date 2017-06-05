package org.domeos.framework.api.mapper.domeos.alarm;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * Created by baokangwang on 2016/4/13.
 */
@Mapper
public interface TemplateStrategyBindMapper {

    @Insert("INSERT INTO alarm_template_strategy_bind(templateId, strategyId, bindTime) VALUES (" +
            "#{templateId}, #{strategyId}, #{bindTime})")
    int addTemplateStrategyBind(@Param("templateId") long templateId, @Param("strategyId") long strategyId, @Param("bindTime") long bindTime);

    @Delete("DELETE FROM alarm_template_strategy_bind WHERE templateId=#{templateId}")
    int deleteTemplateStrategyBindByTemplateId(@Param("templateId") long templateId);
}

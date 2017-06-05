package org.domeos.framework.api.mapper.domeos.alarm;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.alarm.StrategyInfo;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/13.
 */
@Mapper
public interface StrategyInfoMapper {

    @Insert("INSERT INTO alarm_strategy_info(metric, tag, pointNum, aggregateType, operator, rightValue, note, maxStep) VALUES (" +
            "#{metric}, #{tag}, #{pointNum}, #{aggregateType}, #{operator}, #{rightValue}, #{note}, #{maxStep})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addStrategyInfo(StrategyInfo strategyInfo);

    @Delete("DELETE FROM alarm_strategy_info WHERE id IN " +
            "(SELECT strategyId FROM alarm_template_strategy_bind WHERE templateId=#{templateId})")
    int deleteStrategyInfoByTemplateId(@Param("templateId") long templateId);

    @Select("SELECT * FROM alarm_strategy_info WHERE id IN " +
            "(SELECT strategyId FROM alarm_template_strategy_bind WHERE templateId=#{templateId})")
    List<StrategyInfo> listStrategyInfoByTemplateId(@Param("templateId") long templateId);
}

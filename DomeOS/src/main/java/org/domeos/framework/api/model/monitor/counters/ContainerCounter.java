package org.domeos.framework.api.model.monitor.counters;

/**
 * Created by baokangwang on 2016/3/6.
 */
public class ContainerCounter {
    public static Counter[] Counters = {
            new Counter("container.cpu.usage.busy", "cpu", true),
            new Counter("container.cpu.usage.user", "cpu", true),
            new Counter("container.cpu.usage.system", "cpu", true),
            new Counter("container.mem.limit", "memory", true),
            new Counter("container.mem.usage", "memory", true),
            new Counter("container.mem.usage.percent", "memory", true),
            new Counter("container.net.if.in.bytes", "network", true),
            new Counter("container.net.if.out.bytes", "network", true)
    };
}
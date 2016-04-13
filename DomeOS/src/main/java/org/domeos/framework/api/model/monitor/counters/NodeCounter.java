package org.domeos.framework.api.model.monitor.counters;

/**
 * Created by baokangwang on 2016/3/6.
 */
public class NodeCounter {

    public static Counter[] Counters = {
            new Counter("cpu.busy", "cpu", false),
            new Counter("cpu.user", "cpu", false),
            new Counter("cpu.nice", "cpu", false),
            new Counter("cpu.system", "cpu", false),
            new Counter("cpu.iowait", "cpu", false),
            new Counter("cpu.irq", "cpu", false),
            new Counter("cpu.softsystem", "cpu", false),
            new Counter("cpu.switches", "cpu", false),
            new Counter("mem.memtotal", "memory", false),
            new Counter("mem.memused", "memory", false),
            new Counter("mem.memused.percent", "memory", false),
            new Counter("df.bytes.total", "disk", true),
            new Counter("df.bytes.used", "disk", true),
            new Counter("df.bytes.used.percent", "disk", true),
            new Counter("disk.io.read_bytes", "disk", true),
            new Counter("disk.io.write_bytes", "disk", true),
            new Counter("net.if.in.bytes", "network", true),
            new Counter("net.if.out.bytes", "network", true)
    };
}

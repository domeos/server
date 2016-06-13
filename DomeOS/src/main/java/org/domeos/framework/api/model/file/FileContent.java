package org.domeos.framework.api.model.file;

import org.domeos.framework.engine.model.RowModelBase;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by baokangwang on 2016/4/6.
 */
public class FileContent extends RowModelBase {

    String md5;
    byte[] content;

    public FileContent(String md5, byte[] content) {
        this.md5 = md5;
        this.content = content;
    }

    @Override
    public Set<String> excludeForJSON() {
        return toExclude;
    }

    public static Set<String> toExclude = new HashSet<String>() {{
        add("md5");
        add("content");
        addAll(RowModelBase.toExclude);
    }};


    public FileContent() {
    }

    public FileContent(byte[] content) {
        this.content = content;
    }

    public String getMd5() {
        return md5;
    }

    public void setMd5(String md5) {
        this.md5 = md5;
    }

    public byte[] getContent() {
        return content;
    }

    public void setContent(byte[] content) {
        this.content = content;
    }
}

package org.domeos.api.model.project;

/**
 * Created by feiliu206363 on 2015/11/18.
 */
public class UploadFileContent {
    int id;
    String name;
    String md5;
    byte[] content;

    public UploadFileContent() {}

    public UploadFileContent(String name, String md5, byte[] content) {
        this.name = name;
        this.md5 = md5;
        this.content = content;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

package org.domeos.api.model.global;

/**
 */
public class LabelSelector {
    private String name;
//    private LabelOperator op;
    private String content;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

//    public LabelOperator getOp() {
//        return op;
//    }
//
//    public void setOp(LabelOperator op) {
//        this.op = op;
//    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

//    public static enum LabelOperator {
//
//        EQ("="),
//        NOTEQ("!="),
//        IN("in"),
//        NOTIN("notin"),
//        EXISTS("exists");
//
//        private final String op;
//
//        private LabelOperator(String s) {
//            this.op = s;
//        }
//    }
}

package org.domeos.framework.engine.model;

import junit.framework.TestCase;
import org.junit.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by sparkchen on 16/4/4.
 */
public class DataModelBaseTest extends TestCase {

    @Test
    public void testFromString() throws Exception {
        Model1 model = new Model1();
        model.field4 = new Model2();
        model.field4.field2.add("List1");
        model.field4.field2.add("List2");
        model.field4.field2.add("List3");

        String str = model.toString();
        System.out.println(str);
        assertEquals(str, "{\"ver\":1,\"fqcn\":\"org.domeos.framework.engine.model.Model1\",\"field1\":4,\"field2\":\"value2\",\"field3\":1.2,\"field4\":{\"field1\":5,\"field2\":[\"List1\",\"List2\",\"List3\"]}}");

        String testStr1 = "{\"ver\":1,\"fqcn\":\"org.domeos.framework.engine.model.Model1\",\"field1\":3,\"field2\":\"value2\",\"field3\":2.2,\"field4\":{\"field1\":5,\"field2\":[\"List1\",\"List2\"]}}";
        Model1 model1 = new Model1();
        Model1 out = model1.fromString(testStr1);
        assertEquals(out.field1, 3);
        assertEquals(out.field4.field2.size(), 2);
    }

    @Test
    public void testFromString1() throws Exception {

        Model3 model3 = new Model3();
        model3.field1 = 100;
        String str = model3.toString();
        System.out.println(str);
        assertEquals(str, "{\"ver\":2,\"fqcn\":\"org.domeos.framework.engine.model.Model3\",\"field1\":100}");

        String testStr1 = "{\"ver\":1,\"fqcn\":\"org.domeos.framework.engine.model.Model3\",\"field1\":1000}";
        Model3 model31 = new Model3();
        model31 = model31.fromString(testStr1);
        assertEquals(model31.field1 , 1001);

    }

    public void testSpeicalChar() throws Exception {
        Model1 model1 = new Model1();
        model1.setDescription("sdfsdf");
        model1.field2 = "line1\nline2\nline3";
        System.out.println(model1.field2);
        String model1Str = model1.toString();
        System.out.println(model1Str);
        Model1 model2 = model1.fromString(model1Str);
        System.out.println(model2.field2);
        int x = '\n';
        int y = '\r';
        System.out.println("x="+x+",y="+y);
    }
}

class Model3 extends RowModelBase{
    @Override
    public int VERSION_NOW() {
        return 2;
    }
    public static String VERSION_NOW = "v2";

    public int field1 = 3;

    @Override
    public Model3 fromString(String str, int ver) {
        try {
            Model3 result = new Model3();
            result.field1 = objectMapper.readTree(str).get("field1").asInt() + 1;
            return result;
        } catch (IOException e) {
            return null;
        }
    }

}
class Model2 {
    public int field1 = 5;
    public List<String> field2 = new ArrayList<>();

}
class Model1 extends RowModelBase {
    public int field1 = 4;
    public String field2 = "value2";
    public float field3 = 1.2f;
    public Model2 field4;
}
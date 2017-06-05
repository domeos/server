import groovyx.net.http.HTTPBuilder
import org.domeos.util.CommonUtil
import org.domeos.util.MD5Util

class DefaultWechatSender {
    public Object send(String number, String subject, String content) throws Exception {
        def timestamp = CommonUtil.timestamp();
        try {
            def enc = MD5Util.md5(('101107' + number + timestamp + '2e8f0780d2a8a04caeb5716562981dc3').getBytes("utf-8"))
            def params = ['body': ['appid'     : '101107',
                                   'destnumber': number,
                                   'content'   : content,
                                   'timestamp' : timestamp,
                                   'enc'       : enc]]
            def httpclient = new HTTPBuilder('http://sms.tv.sohuno.com/wms/send.do')
            httpclient.post(params)
        } catch (Exception e) {
            return e.getMessage()
        }
        return ''
    }
}
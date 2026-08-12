1. onShouldStartLoadWithRequest不支持异步，阻塞UI线程；必须开启worker。
2. clearCache方法问题
3. navigationType始终为Other
# Telemetry
This option is for configuring Live API Creator to collect and send usage data. For details see [Activate and Configure Usage Data](https://docops.ca.com/ca-live-api-creator/5-2/en/configuring/activate-and-configure-to-send-usage-data).
Note: You must use the 'sa' login to access these values.

```
   Usage: telemetry [options] <list|update>
  
   Administer Telemetry Usage information (requires sa logon).
   
   Options:
     --chargebackID [value]      Chargeback ID
     --domainName [value]        Domain Name
     --plaEnabled [true|false]   Enable PLA.
     --sendEnabled [true|false]  Enable sending telemetry data.
     --siteID [value]            Site ID.
     --proxyURL [value]          Proxy URL.
     --proxyPort [value]         Proxy Port.
     --proxyUsername [value]     Proxy UserName.
     --proxyPassword [value]     Proxy Plaintext Password.
     -v, --verbose               optional: used by list to display all telemetry options.
     -h, --help                  output usage information
     
     

```


***
## telemetry list
List of commands allows you to list your CA Live API Creator defined telemetery settings. 

```
    $lacadmin telemetry list [--verbose]
```

The `list` command shows all the current settings of telemtry.

#### Output
```
Telemetry                                                                                                                                                                                   
ChargeBack              DomainName            PLA Enabled  Send Telemetry  Site ID  Proxy URL  Proxy Port  Proxy UserName  Proxy PW
----------------------  --------------------  -----------  --------------  -------  ---------  ----------  --------------  --------
<_CHARGEBACK_ID_HERE_>  <_DOMAIN_NAME_HERE_>  false        false                                                           <hidden>

# telemetry: 1                                                                                                                                                   
```


## update
You can change one or more values by passing in an argument and value.  
Note: A server restart is required for these properties to take effect.
```
   lacadmin telemetry update  
        --chargebackID '<_CHARGEBACK_ID_HERE_> '
        --domainName '<_DOMAIN_NAME_HERE_>' 
        --plaEnabled false 
        --sendEnabled false 
        --siteID 12345 
        --proxyURL http://localhost 
        --proxyPort 9090 
        --proxyUsername 'usernmae' 
        --proxyPassword '<password>'
    
chargebackID prop_value =<_CHARGEBACK_ID_HERE_> for prop_name = telemetry_chargeback_id
DomainName prop_value =<_DOMAIN_NAME_HERE_> for prop_name = telemetry_domain_name
PLA Enabled prop_value =false for prop_name = telemetry_pla_enabled
Send Telemetry prop_value =false for prop_name = telemetry_send_enabled
Site ID prop_value =12345 for prop_name = telemetry_site_id
Proxy URL prop_value =http://localhost for prop_name = telemetry_proxy_url
Proxy Port prop_value =1234 for prop_name = telemetry_proxy_port
Proxy UserName prop_value =usernmae for prop_name = telemetry_proxy_username
Proxy PW prop_value =<password> for prop_name = telemetry_proxy_plain_password
Telemetry(s) values updated:                                                                                                                                                                
Changes to Telemetery require a server restart    
```



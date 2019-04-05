# Telemetry
This feature is for Telemetry PLA management. For details see [Activate and Configure Usage Data](https://docops.ca.com/ca-live-api-creator/5-2/en/configuring/activate-and-configure-to-send-usage-data).

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
List of commands allows you to list your CA Live API Creator defined TeamSpaces. 

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

# telemtry: 1                                                                                                                                                   
```


## update
You can change one or more values by passing in an argument and value.
```
   lacadmin telemetry update  
        --chargebackID <_CHARGEBACK_ID_HERE_> 
        --domainName '<_DOMAIN_NAME_HERE_>' 
        --plaEnabled false 
        --sendEnabled false 
        --siteID 12345 
        --proxyURL http://localhost 
        --proxyPort 9090 
        --proxyUsername 'usernmae' 
        --proxyPassword '<password>'
    
```



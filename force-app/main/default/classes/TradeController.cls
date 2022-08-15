public with sharing class TradeController {
     
    @AuraEnabled(cacheable=true)
    public static String getBookedTrades(Integer pageSize, Integer pageNumber){
        String jsonResponse = '';
         
        //Offset for SOQL
        Integer offset = (pageNumber - 1) * pageSize;
         
        //Total Records
        Integer totalRecords = [SELECT COUNT() FROM Trade__c WITH SECURITY_ENFORCED];
        Integer recordEnd = pageSize * pageNumber;
         
        TradeWrapper wrapper =  new TradeWrapper();  
        wrapper.pageSize = pageSize;
        wrapper.pageNumber = pageNumber;
        wrapper.recordStart = offset + 1;
        wrapper.recordEnd = totalRecords >= recordEnd ? recordEnd : totalRecords;
        wrapper.totalRecords = totalRecords;
        wrapper.trades = [SELECT Id, Name, Sell_Currency__c, Sell_Amount__c, Buy_Currency__c, Buy_Amount__c, Rate__c, Date_booked__c 
                            FROM Trade__c WITH SECURITY_ENFORCED ORDER BY Date_booked__c DESC LIMIT :pageSize OFFSET :offset];
        
        jsonResponse = JSON.serialize(wrapper);
        return jsonResponse;
    }

    @AuraEnabled
    public static void insertTrade(Trade__c trade){
        try{
            trade.Date_booked__c = Datetime.now();
            insert trade;
        }catch(Exception ex){
            throw new AuraHandledException(ex.getMessage());
        }
    }
     
    public class TradeWrapper {
        public Integer pageSize {get;set;}
        public Integer pageNumber {get;set;}
        public Integer totalRecords {get;set;}
        public Integer recordStart {get;set;}
        public Integer recordEnd {get;set;}
        public List<Trade__c> trades {get;set;}
    }
}
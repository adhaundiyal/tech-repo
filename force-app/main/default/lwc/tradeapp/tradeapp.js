import { LightningElement, track, wire  } from 'lwc';
import getBookedTrades from '@salesforce/apex/TradeController.getBookedTrades';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import insertTrade from '@salesforce/apex/TradeController.insertTrade';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import TRADE_OBJINFO from '@salesforce/schema/Trade__c';
import SELL_CCY_FIELD  from '@salesforce/schema/Trade__c.Sell_Currency__c';
import BUY_CCY_FIELD from '@salesforce/schema/Trade__c.Buy_Currency__c';
 
export default class Tradeapp extends LightningElement {
    
    @track loader = false;
    @track error = null;
    @track pageSize = 5;
    @track pageNumber = 1;
    @track totalRecords = 0;
    @track totalPages = 0;
    @track recordEnd = 0;
    @track recordStart = 0;
    @track isPrev = true;
    @track isNext = true;
    @track trades = [];
   
    @track newtrade ={};   
    @track sellCCY;
    @track buyCCY;
    @track sellCCYOptions;
    @track buyCCYOptions;
    @track sellAmount;
    @track rate;
    @track buyAmount;
    @track spinnerStatus =false;

    @track customFormModal = false; 
    
    customShowModalPopup() {            
        this.customFormModal = true;
    }
 
    customHideModalPopup() {     
        this.customFormModal = false;  
    }
 
    //handle next
    handleNext(){
        this.pageNumber = this.pageNumber+1;
    }
 
    //handle prev
    handlePrev(){
        this.pageNumber = this.pageNumber-1;
    }

    @wire(getBookedTrades, {pageSize: '$pageSize' , pageNumber : '$pageNumber'})
    wiredContact({error, data}){
        this.loader = true;
        if(data){ 
                this.loader = false;
                console.log('data: '+ data);
                console.log('stringify: '+ JSON.stringify(data));
                console.log('JSON.parse(data): '+ JSON.parse(data));
                console.log('stringify: '+ JSON.stringify(JSON.parse(data)));
                console.log('data.pageNumber: '+ data.pageNumber);
                console.log('data.trades: '+ data.trades);
                let resultData = JSON.parse(data);                
                this.pageNumber = resultData.pageNumber;
                this.totalRecords = resultData.totalRecords;
                this.recordStart = resultData.recordStart;
                this.recordEnd = resultData.recordEnd;
                this.totalPages = Math.ceil(resultData.totalRecords / this.pageSize);
                this.isNext = (this.pageNumber === this.totalPages || this.totalPages === 0);
                this.isPrev = (this.pageNumber === 1 || this.totalRecords < this.pageSize);

                let rows = JSON.parse( JSON.stringify( resultData.trades ) );
                const options = {
                    year: 'numeric', month: 'numeric', day: 'numeric',
                    hour: 'numeric', minute: 'numeric', hour12: false
                };
                
                for ( let i = 0; i < rows.length; i++ ) {  

                    let dataParse = rows[i];
                    if ( dataParse.Date_booked__c ) {                        
                        let dt = new Date( dataParse.Date_booked__c );
                        dataParse.Date_booked__c = new Intl.DateTimeFormat( 'en-UK', options ).format( dt );
                    
                    }
    
                }
                this.trades = rows;
            }
        if(error){
            this.error = error;
            this.loader = false;
        }
    }
 
    //display no records
    get isDisplayNoRecords() {
        var isDisplay = true;
        if(this.trades){
            if(this.trades.length === 0){
                isDisplay = true;
            }else{
                isDisplay = false;
            }
        }
        return isDisplay;
    }


    @wire( getObjectInfo ,{
        objectApiName:TRADE_OBJINFO
    })
    tradeInfo
    
    @wire(getPicklistValues,{
        recordTypeId: '$tradeInfo.data.defaultRecordTypeId',
        fieldApiName: SELL_CCY_FIELD
    })
    sellCCYPicklist({ error, data}){
            if(data){
                this.sellCCYOptions = data.values;
            }else if(error){
                this.error = error;
        }
    }
    // Getting Sell currency value
    handleSellCCYChange(event) {
        this.sellCCY = event.detail.value;
        this.newtrade.Sell_Currency__c = this.sellCCY;
    }

    // Getting Sell Amount value
    handleSellAmountChange(event) {
        this.sellAmount = event.detail.value;
        this.newtrade.Sell_Amount__c = this.sellAmount;

        if(this.rate){
            this.buyAmount = this.sellAmount * this.rate;
            this.newtrade.Buy_Amount__c = this.buyAmount;
        }
    }

    @wire(getPicklistValues,{
        recordTypeId: '$tradeInfo.data.defaultRecordTypeId',
        fieldApiName: BUY_CCY_FIELD
    })
    buyCCYPicklist({data,error}){
        if(data){
            this.buyCCYOptions=data.values;
        }else if(error){
            this.error = error;
        }
    }
     // Getting Buy currency value
     handleBuyCCYChange(event) {
        this.buyCCY = event.detail.value;
        this.newtrade.Buy_Currency__c = this.buyCCY;
        fetch('https://api.apilayer.com/fixer/latest?symbols=' 
                    + this.buyCCY + '&base=' + this.sellCCY , 
        {
            // Request type
            method:"GET",


            headers:{
                // content type
                "Content-Type": "application/json",
                // adding your api key 
                "apikey": "1Hvay3LCjNCOX8vg48BWkL2rbQX3ciQi",
            }

        })
        .then((response) => {
            return response.json();
        })
        .then((jsonResponse) => {

            window.console.log('jsonResponse ===> '+JSON.stringify(jsonResponse));

            let rates = jsonResponse.rates;
            this.rate = rates[this.buyCCY];
            this.newtrade.Rate__c = this.rate;
        })
        .catch(error => {
            window.console.log('callout error ===> '+JSON.stringify(error));
        })

    }

    // Getting Buy Amount value
    handleBuyAmountChange(event) {
        this.buyAmount = event.detail.value;
        this.newtrade.Buy_Amount__c = this.buyAmount;
    }
    toastEventFire(title,msg,variant,mode){
        const e = new ShowToastEvent({
            title: title,
            message: msg,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(e);
    }        
    handleForSave(){
        this.spinnerStatus = true;
        insertTrade({ trade : this.newtrade})
        .then(result =>{
            this.spinnerStatus = false;
            this.sellCCY='';
            this.sellAmount='';
            this.rate='';
            this.buyCCY='';
            this.buyAmount='';
            this.toastEventFire('Success','New Trade is Saved','success');                      
        })
        .catch(error =>{
            this.error = error.message;
        })
    }
    
}
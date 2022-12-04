import { LightningElement, wire} from 'lwc';
import createMortgageHistory from '@salesforce/apex/mortgageHistoryController.createMortgageHistory';
import mortgageData from '@salesforce/apex/mortgageData.getMorgageRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import mortgageCalc from '@salesforce/resourceUrl/ChartJs';

export default class MortgageCalculator extends LightningElement {
    mortgageCalc = mortgageCalc

   

chartConfiguration;

    @wire(mortgageData)
    mortData;
    
        //Properties 
        amount 
        rate 
        term 
        paymentFreq 
       
     
        //Result object for UI 
        result;
     
        get options() { 
            return [ 
                { label: 'Monthly', value: 'Monthly' }, 
                { label: 'Semimonthly', value: 'Semimonthly' }, 
                { label: 'Weekly', value: 'Weekly' }, 
                { label: 'Biweekly', value: 'Biweekly' }, 
            ] 
        } 
     
        comboboxHandler(event) { 
            console.log(`Selected value; ${event.target.label}`) 
            this.paymentFreq = event.target.value 
        } 
     
        //Event handling for onchange inputs 
        onChangeAmount(event) { 
     
            this.amount = event.target.value 
            console.log(`This amount is : ${this.amount}`) 
     
        } 
     
        onChangeInterest(event) { 
            this.rate = event.target.value 
        } 
     
        onChangeAmort(event) { 
            this.term = event.target.value 
        } 
     
        //Buttons  
        getResultHandler() { 
     
            if (this.amount != null && this.rate != null && this.paymentFreq != null && this.term != null) { 
                console.log('they all have values, please proceed') 

                
     
                //Making sure result object is empty 
                this.result = {}
                this.show = !this.show 

                const event = new ShowToastEvent({
                    title: 'Success',
                    message: 'Successfully calculated',
                    variant: 'Success',
                   
                })
                this.dispatchEvent(event)
     
     
                let yearlyPayment 
                let monthlyRate = Number(this.rate) / 100 / 12 //calulcaute monthly interest rate 
                let numMonths = Number(this.term) * 12 // calculate the number of months . for example 10 years * 12 => 120 months 
     

                  //Data for chart JS
            this.chartConfiguration = {}
            let data = []
            data.push(this.amount)



     
                //Calculate monthly paymnet 
                let monthlyPayment = Number(this.amount) * 
                    ( 
                        (monthlyRate * Math.pow(1 + monthlyRate, numMonths)) / 
                        (Math.pow(1 + monthlyRate, numMonths) - 1) 
                    ) 
     
                //Calculation depending frequency (monthly, bimonthly, weekly, biweekly) 
                if(this.paymentFreq === 'Monthly'){ 
     
                    monthlyPayment = monthlyPayment.toFixed(2) 
                    yearlyPayment = (monthlyPayment * numMonths).toFixed(2) 
     
                    this.result = { 
                        yearlyPayment: yearlyPayment, 
                        partialAmount: monthlyPayment, 
                        partialPmtType: 'Monthly', 
                    } 

                    let dmInterestDollars = (yearlyPayment - this.amount).toFixed(2)
                    console.log('dmInterestDollars', dmInterestDollars)
                    data.push(dmInterestDollars)
     
                }else if(this.paymentFreq === 'Semimonthly'){ 
     
                    let semiMonthPmt = (monthlyPayment / 2).toFixed(2) 
                    yearlyPayment = (monthlyPayment * numMonths ).toFixed(2) 
     
                    this.result = { 
                        yearlyPayment: yearlyPayment, 
                        partialAmount: semiMonthPmt, 
                        partialPmtType: 'Semimonthly', 
                    } 
                    let dmInterestDollars = (yearlyPayment - this.amount).toFixed(2)
                console.log('dmInterestDollars', dmInterestDollars)
                data.push(dmInterestDollars)
     
                }else if(this.paymentFreq === 'Weekly'){ 
     
                    let weekltPmt = ((monthlyPayment * 12)/52).toFixed(2) 
                    yearlyPayment = (monthlyPayment * numMonths ).toFixed(2) 
 
                    this.result = { 
                        yearlyPayment: yearlyPayment, 
                        partialAmount: weekltPmt, 
                        partialPmtType: 'Weekly', 
                    } 

                    let dmInterestDollars = (yearlyPayment - this.amount).toFixed(2)
                    console.log('dmInterestDollars', dmInterestDollars)
                    data.push(dmInterestDollars)
     
                }else if(this.paymentFreq === 'Biweekly'){ 
     
                    let biweeklyPmt = ((monthlyPayment * 12)/26).toFixed(2) 
                    yearlyPayment = (monthlyPayment * numMonths ).toFixed(2) 
 
                    this.result = { 
                        yearlyPayment: yearlyPayment, 
                        partialAmount: biweeklyPmt, 
                        partialPmtType: 'Biweekly', 
                    } 


                    let dmInterestDollars = (yearlyPayment - this.amount).toFixed(2)
                    console.log('dmInterestDollars', dmInterestDollars)
                    data.push(dmInterestDollars)

                    
     
                } 

                

                console.log(this.result)
            this.updateChart(data)




     
     
            } else { 
                console.log('at least one property does not have value')
                const event = new ShowToastEvent({
                    title: 'Error',
                    message: 'Please, enter input values',
                    variant: 'error'
                })
                this.dispatchEvent(event) 
            }

        } 



        clearHandler(){
            this.template.querySelectorAll('lightning-input').forEach(element => {
                element.value = null;
                this.result = null;   
              });

              this.template.querySelectorAll('lightning-combobox').forEach(element => {   
                element.value = false;
                this.selectedvalue = '';    
                   
              });  

             

              this.result = false;

              const event = new ShowToastEvent({
                title: 'Warning',
                message: 'The inputs have been cleared',
                variant: 'warning'
            })
            this.dispatchEvent(event)
        }





     
        saveResultHandler() { 

            if (this.amount != null
                 && this.rate != null
                  && this.paymentFreq != null
                   && this.term != null
                   && this.result.yearlyPayment!=null
                   && this.result.partialAmount!=null
                   && this.result.partialPmtType!=null
                   ){
                    createMortgageHistory({amount: this.amount,
                                            rate: parseFloat(this.rate),
                                            amortization: this.term,
                                            paymentfrequency: this.paymentFreq,
                                            partialPayment: parseFloat(this.result.partialAmount),
                                            totalPayment: parseFloat(this.result.yearlyPayment)



                    });

                    const event = new ShowToastEvent({
                        title: 'Success',
                        message: 'This calculation history successfully has been successfully saved',
                        variant: 'success'
                    })
                    this.dispatchEvent(event)

                   
                    
                    .then(response=>{
                        console.log(response)
                    })
                    .catch(error=>{
                        console.log(error)

                        

                    })}else{
                        const event = new ShowToastEvent({
                            title: 'Error',
                            message: 'Please, enter input values',
                            variant: 'error'
                        })
                        this.dispatchEvent(event)
                    }





                    


                 }



                 //Update the chart
    updateChart(data) {
        let chartData = [...data]
        let chartLabels = ["Principle ($)", "Interest($)"]


        this.chartConfiguration = {
            type: "doughnut",
            data: {
                labels: chartLabels,
                datasets: [
                    {
                        label: 'Mortgage Amount',
                        data: chartData,
                        backgroundColor: ['rgb(255, 99, 132)',
                            'rgb(75, 192, 192)',]
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top"
                    },
                    title: {
                        display: true,
                        text: "Chart.JS Doughnut Chart of Mortgage Amount"
                    }
                }
            }
        }
    }














                 visitHandler(){

                 }


                 deleteHandler(){



                 }




        }
         

        




    

     

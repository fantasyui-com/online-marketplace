module.exports = function(i){

  /*

    Here we deal with expanding base information so that views can just print values without any magic.
    1. All prices are in cents under amount property, this needs to be expanded.
    2. A product link should be defined here (specifically for online-marketplace purposes)

  */

    i.amount = i.licensing[0].amount; // copy the first which is the standard price.

    i.price = (parseInt(i.licensing[0].amount)/100).toFixed(2);// + " " + i.currency.toUpperCase();
    i.price = i.price.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

    i.licensing = i.licensing.map(j=>{
      j.price = (parseInt(j.amount)/100).toFixed(2); // + " " + i.currency.toUpperCase();
      j.price = j.price.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
      return j;
    })

    i.link = `product/${i.authorId}/${i.name}`;

    return i;
}

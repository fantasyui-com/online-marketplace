module.exports = function(i){

    i.price = (parseInt(i.licensing[0].amount)/100).toFixed(2);// + " " + i.currency.toUpperCase();

    i.licensing = i.licensing.map(j=>{
      j.price = (parseInt(j.amount)/100).toFixed(2); // + " " + i.currency.toUpperCase();
      j.price = j.price.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
      return j;
    })

    i.link = `product/${i.authorId}/${i.name}`;

    return i;
}

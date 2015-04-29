$(document).ready(function() {
  $.get('/public/data.json').done(function (data) {
    data.forEach(function(t, index){
      var html = _.template($('#t-table').html())({category: t.category.replace(' ', '-').replace('\n',''),table_index: index});
      $('#container').append(html);
      t.data.forEach(function(item, i){
        var tr = _.template($('#t-tr').html())({text: item,index: i + 1});
        $('#table-' + index).find('tbody').append(tr);
      });
    })
  })
});

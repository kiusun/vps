var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var linkSchema = new Schema({
    linkId: {type: String , required: true},
    imgUrl: {type: String , required : true},
    linkFake: {type: String , required: true},
    domain: {type: String , required: true},
    title: {type: String},
    user: {type: String ,required : true}
});
module.exports = mongoose.model('Links', linkSchema);

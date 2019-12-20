<template>
  <div class="hello">
    <vue-good-table
        mode="remote"
        @on-search="searchQuery"
        @on-page-change="pageChange"
        @on-per-page-change="perpageChange"
        @on-sort-change="onSortChange"
        @on-row-click="onRowClick"
        @on-cell-click="onCellClick"
        :pagination-options="{
            enabled: true,
            mode: 'pages',
            perPage: 4,
            position: 'bottom',
            perPageDropdown: [4, 7, 10],
            dropdownAllowAll: false
        }"
        :total-rows="props.totalRecords"
        :isLoading.sync="props.isLoading"
        :columns="columns"
        :rows="rows"
        :search-options="{
            enabled: true,
            trigger: 'enter',
            skipDiacritics: true,
            placeholder: props.searchname
    }">
        <div slot="emptystate">
            No {{props.norowsfound}} found
        </div>
        <template slot="table-row" slot-scope="props">
            <span v-if="props.column.field == 'images'">
                <li v-for="image in props.formattedRow[props.column.field]">
                        <b-img v-bind:src="image.uri" fluid @click="showImage(props.row.id)"/>
                </li>
                <LightBox :images="imageList(props.formattedRow[props.column.field])" :showLightBox="false" :showThumbs="true" :ref="'lightbox' + props.row.id"></LightBox>
            </span>
            <span v-else-if="props.column.field == 'title'">
                <a v-bind:href="props.row.uri" target="_new">{{props.row.title.replace(/_/g, ' ')}}</a>
            </span>
            <span v-else-if="props.column.field == 'id'">
                <star-rating @rating-selected="setRating" :rating="props.row.rating" :star-size="starsize" :max-rating="3"></star-rating>
            </span>
            <span v-else>
                {{props.formattedRow[props.column.field]}}
            </span>
        </template>
    </vue-good-table>
  </div>
</template>

<script>

import { VueGoodTable } from 'vue-good-table';
import axios from 'axios';
import 'vue-good-table/dist/vue-good-table.css';
import StarRating from 'vue-star-rating';
import LightBox from "vue-image-lightbox";

export default {
  name: "custom-table",
  props: {
      props: {
          type: Object,
          required: true
      }
  },
  data() { 
    return {
        rating: 0,
        starsize: 30,
        columns: [
                {
                    label: 'Title',
                    field: 'title',
                    filterable: true
                },
                {
                    field: 'uri',
                    hidden: true
                },
                {
                    label: 'Images',
                    field: 'images'
                },
                {
                    label: 'Save',
                    field: 'id'
                }
            ],
        rows: [],
        serverParams: {
            columnFilters: {},
            sort: {
                field: '', 
                type: '',
            },
            page: 1,
            perPage: 4,
            searchTerms: ''
        }
    }
  },
  methods: {
    imageList(images){
        let temp = images.map( (img) => {
            console.log(img.uri);
            let a = {};
            a.src = img.uri;
            a.thumb = img.uri;
            return a;
        })
        return temp;
    },
    showImage(index){
        let name = 'lightbox' + index;
        this.$refs[name].showImage(0);
    },
    setRating(rating){
        this.rating = rating;
    },
    searchQuery(param){
        this.serverParams.searchTerms = param.searchTerm;
        console.log("SearchQuery Term:", param.searchTerm);
        this.loadItems();
    },
    onRowClick(param){
        //console.log("On Row Click:", param);
    },
    rowStyleClassFn(row) {
        //return row.images.length > 0 ? 'red' : 'none';
        return row;
    },
    onCellClick(params) {
        if(params.column.field == "id"){
            console.log(params.row.id, params.row.title, this.rating);
            let url = this.props.remoteURL + '/' + params.row.id;

            let data = {
                "rating": this.rating
            };

            axios
            .patch(url, data).then(response => {
                console.log(response);
            });
        }
        // params.row - row object 
        // params.column - column object
        // params.rowIndex - index of this row on the current page.
        // params.event - click event
    },
    updateParams(newProps) {
        this.serverParams = Object.assign({}, this.serverParams, newProps);
    },
    pageChange(params) {
        console.log("page change", params);
        this.updateParams({page: params.currentPage});
        this.loadItems();
    },
    perpageChange(params) {
        console.log("perpage change", params);  
        this.updateParams({perPage: params.currentPerPage});
        this.loadItems();
    },
    onSortChange(params) {
        console.log("sort change", params);
        this.updateParams({
        sort: [{
          type: params.sortType,
          field: this.columns[params.columnIndex].field,
        }],
      });
        this.loadItems();
    },
    onColumnFilter(params) {
        this.updateParams(params);
        this.loadItems();
    },
    loadItems() {
        console.log("load. SearchTerm:", this.serverParams.searchTerms);
        let remoteURL;
        if(this.props.remoteParams){
            remoteURL = this.props.remoteURL + '?' + this.props.remoteParams;
        }else{
            remoteURL = this.props.remoteURL + '?';
        }
        let url = remoteURL + '&_page=' + this.serverParams.page + '&_limit=' + this.serverParams.perPage;
        
        if(this.serverParams.searchTerms){
            url = url + '&q=' + this.serverParams.searchTerms;
            console.log("URL", url);
        }
        axios
        .get(url, { body: this.serverParams}).then(response => {
            this.totalRecords = response.data.totalRecords;
            this.rows = response.data.rows;
        });
    }
  },
  mounted(){
      this.loadItems()
  },
  components: {
      VueGoodTable,
      StarRating,
      LightBox
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>

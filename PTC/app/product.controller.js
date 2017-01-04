(function() {
    'use strict';

    angular.module('app').controller('ProductController', ProductController);

    function ProductController($http) {

        const pageMode = {
            LIST: 'List',
            EDIT: 'Edit',
            ADD: 'Add'
        };

        var vm = this;
        var dataService = $http;

        // Hook up public events
        vm.resetSearch = resetSearch;
        vm.searchImmediate = searchImmediate;
        vm.search = search;
        vm.addCick = addClick;
        vm.cancelClick = cancelClick;
        vm.editClick = editClick;
        vm.deleteClick = deleteCick;
        vm.saveClick = saveClick;



        vm.product = {};
        vm.categories = [];
        vm.products = [];
        vm.product = {
            ProductId: 1,
            ProductName: 'Video Training'
        };
        vm.searchCategories = [];
        vm.searchInput = {
            selectedCategory: {
                CategoryId: 0,
                CategoryName: ''
            },
            productName: ''
        };

        vm.uiState = {
            mode: pageMode.LIST,
            isDetailAreaVisible: false,
            isListAreaVisible: true,
            isSearchAreaVisible: true,
            isValid: true,
            messages: []
        };


        productList();
        searchCategoriesList();
        catergoryList();


        function addClick() {
            vm.product = initEntity();
            setUIState(pageMode.ADD);
        }

        function editClick(id) {
            productGet(id);
            setUIState(pageMode.EDIT);
        }

        function cancelClick(productForm) {
            productForm.$setPristine();
            productForm.$valid = true;
            vm.uiState.isValid = true;

            setUIState(pageMode.LIST);
        }

        function deleteCick(id) {
            if (confirm('Delete this product?')) {
                deleteData(id);
            }
        }

        function saveClick(productForm) {
            if (productForm.$valid) {
                if (validateData()) {
                    productForm.$setPristine();
                    if (vm.uiState.mode === pageMode.ADD) {
                        insertData();
                    }
                    else {
                        updateData();
                    }
                }
                else {
                    productForm.$valid = false;
                }
            }
            else {
                vm.uiState.isValid = false;
            }
        }
        function insertData() {
            dataService.post(
                "/api/Product",
                vm.product)
              .then(function (result) {
                  // Update product object
                  vm.product = result.data;

                  // Add Product to Array
                  vm.products.push(vm.product);

                  setUIState(pageMode.LIST);
              }, function (error) {
                  handleException(error);
              });
        }

        function setUIState(state) {
           
            vm.uiState.mode = state;

            vm.uiState.isDetailAreaVisible = (state === pageMode.ADD || state === pageMode.EDIT);
            vm.uiState.isListAreaVisible = (state === pageMode.LIST);
            vm.uiState.isSearchAreaVisible = (state === pageMode.LIST);
        }

        function addValidationMessage(prop, msg) {
            vm.uiState.messages.push({
                property: prop,
                message: msg
            });
        }

        function resetSearch() {
            vm.searchInput = {
                selectedCategory: {
                    CategoryId: 0,
                    CategoryName: ''
                },
                productName: ''
            };

            productList();
        }

        function search() {
            // Create object literal for search values
            var searchEntity = {
                CategoryId:
                    vm.searchInput.selectedCategory.CategoryId,
                ProductName:
                    vm.searchInput.productName
            };

            // Call Web API to get a list of Products
            dataService.post("/api/Product/Search",
                    searchEntity)
                .then(function(result) {
                        vm.products = result.data;
                        setUIState(pageMode.LIST);
                    },
                    function(error) {
                        handleException(error);
                    });
        }

        function searchImmediate(item) {
            if ((vm.searchInput.selectedCategory.CategoryId == 0
                    ? true
                    : vm.searchInput.selectedCategory.CategoryId == item.Category.CategoryId) &&
                (vm.searchInput.productName.length == 0
                    ? true
                    : (item.ProductName.toLowerCase().indexOf(vm.searchInput.productName.toLowerCase()) >= 0))) {
                return true;
            }
            
            return false;
        }

        function validateData() {
            // Fix up date (IE 11 bug workaround)
            vm.product.IntroductionDate =
                    vm.product.IntroductionDate.
                    replace(/\u200E/g, '');

            vm.uiState.messages = [];

            if (vm.product.IntroductionDate != null) {
                if (isNaN(Date.parse(
                      vm.product.IntroductionDate))) {
                    addValidationMessage('IntroductionDate',
                      'Invalid Introduction Date');
                }
            }

            if (vm.product.Url.
              toLowerCase().indexOf("microsoft") >= 0) {
                addValidationMessage('url', 'URL can not contain the words\'microsoft\'.');
            }

            vm.uiState.isValid = (vm.uiState.messages.length == 0);

            return vm.uiState.isValid;
        }

        function updateData() {
            dataService.put("/api/Product/" +
                  vm.product.ProductId,
                  vm.product)
              .then(function (result) {
                  // Update product object
                  vm.product = result.data;

                  // Get index of this product
                  var index = vm.products.map(function (p)
                  { return p.ProductId; })
                      .indexOf(vm.product.ProductId);

                  // Update product in array
                  vm.products[index] = vm.product;

                  setUIState(pageMode.LIST);
              }, function (error) {
                  handleException(error);
              });
        }

        function deleteData(id) {
            dataService.delete(
                      "/api/Product/" + id)
              .then(function (result) {
                  // Get index of this product
                  var index = vm.products.map(function (p)
                  { return p.ProductId; }).indexOf(id);

                  // Remove product from array
                  vm.products.splice(index, 1);

                  setUIState(pageMode.LIST);
              }, function (error) {
                  handleException(error);
              });
        }

        function productGet(id) {
            // Call Web API to get a product
            dataService.get("/api/Product/" + id)
              .then(function (result) {
                  // Display product
                  vm.product = result.data;

                  // Convert date to local date/time format
                  if (vm.product.IntroductionDate != null) {
                      vm.product.IntroductionDate =
                        new Date(vm.product.IntroductionDate).
                        toLocaleDateString();
                  }
              }, function (error) {
                  handleException(error);
              });
        }

        function productList() {
            dataService.get("/api/Product")
                .then(function(result) {
                        vm.products = result.data;

                        setUIState(pageMode.LIST);
                    },
                    function(error) {
                        handleException(error);
                    });
        }

        function searchCategoriesList() {
            dataService.get("/api/Category/GetSearchCategories")
                .then(function(result) {
                        vm.searchCategories = result.data;
                    },
                    function(error) {
                        handleException(error);
                    });
        }

        function catergoryList() {
            dataService.get("/api/Category")
            .then(function(result) {
                    vm.categories = result.data;
                }, function(error) {
                    handleException(error);
                })
        }

        function initEntity() {
            return {
                ProductId: 0,
                ProductName: '',
                IntroductionDate:
                  new Date().toLocaleDateString(),
                Url: 'http://www.pdsa.com',
                Price: 0,
                Category: {
                    CategoryId: 1,
                    CategoryName: ''
                }
            };
        }

        function handleException(error) {
            vm.uiState.isValid = false;
            var msg = {
                property: 'Error',
                message: ''
            };

            vm.uiState.messages = [];

            switch (error.status) {
                case 400: //bad request
                    break;
                case 404: //not found
                    msg.message = 'The product you were requesting could not be found';

                    vm.uiState.messages.push(msg);
                    break;
                case 500: //internal server error
                    msg.message =
                        error.data.ExceptionMessage;
                    vm.uiState.messages.push(msg);
                    break;
                
                default:
                    msg.message = 'status: ' +
                        error.status +
                        ' - Error Message: ' +
                        error.statusTest;
                    vm.uiState.messages.push(msg);
                    break;
            }
        }
    }
})();
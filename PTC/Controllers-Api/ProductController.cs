using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Microsoft.Ajax.Utilities;
using PTC.Models;

namespace PTC.Controllers_Api
{
  public class ProductController : ApiController
  {
    // GET api/<controller>
    public IHttpActionResult Get() {
      IHttpActionResult ret = null;
      PTCViewModel vm = new PTCViewModel();

      vm.Get();
      if (vm.Products.Count > 0) {
        ret = Ok(vm.Products);
      }
      else {
        ret = NotFound();
      }

      return ret;
    }

    [HttpPost()]
    [Route("api/Product/Search")]
    public IHttpActionResult Search(
      ProductSearch searchEntity) {
      IHttpActionResult ret = null;
      PTCViewModel vm = new PTCViewModel();

      // Search for Products
      vm.SearchEntity = searchEntity;
      vm.Search();
      if (vm.Products.Count > 0) {
        ret = Ok(vm.Products);
      }
      else {
        ret = NotFound();
      }

      return ret;
    }

    // GET api/<controller>/5
    public IHttpActionResult Get(int id)
    {
        IHttpActionResult ret;
        Product product = new Product();
        PTCViewModel vm = new PTCViewModel();

        product = vm.Get(id);

        if (product != null)
        {
            ret = Ok(product);
        }
        else
        {
            ret = NotFound();
        }

        return ret;

        
    }

        // POST api/<controller>
        [HttpPost()]
        public IHttpActionResult Post(
                Product product)
        {
            IHttpActionResult ret = null;
            PTCViewModel vm = new PTCViewModel();

            vm.Entity = product;
            vm.PageMode = PageConstants.ADD;
            vm.Save();

            if (vm.IsValid)
            {
                ret = Created<Product>(
                        Request.RequestUri +
                        product.ProductId.ToString(),
                          product);
            }
            else
            {
                ret = NotFound();
            }

            return ret;
        }

        // PUT api/<controller>/5
        [HttpPut()]
        public IHttpActionResult Put(int id,
                   Product product)
        {
            IHttpActionResult ret = null;
            PTCViewModel vm = new PTCViewModel();

            vm.Entity = product;
            vm.PageMode = PageConstants.EDIT;
            vm.Save();

            if (vm.IsValid)
            {
                ret = Ok(product);
            }
            else
            {
                ret = NotFound();
            }

            return ret;
        }

        // DELETE api/<controller>/5
        [HttpDelete()]
        public IHttpActionResult Delete(int id)
        {
            IHttpActionResult ret = null;
            PTCViewModel vm = new PTCViewModel();

            // Get the product
            vm.Entity = vm.Get(id);
            // Did we find the product?
            if (vm.Entity.ProductId > 0)
            {
                // Delete the product
                vm.Delete(id);

                ret = Ok(true);
            }
            else
            {
                ret = NotFound();
            }

            return ret;
        }
    }
}
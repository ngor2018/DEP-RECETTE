using DEP_RECETTE.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Dep_RecDLL;

namespace DEP_RECETTE.Controllers
{
    public class CRUDController : Controller
    {
        // GET: CRUD
        SqlCommand com = new SqlCommand();
        SqlDataReader dr;
        Config maConnexion = new Config("NGOR", "Dep_Recette", "ngor", "passer");
        SqlConnection con = new SqlConnection(GetConnexion.GetConnectionString());
        parameter parametre = new parameter();
        public ActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public JsonResult GetDataParam(string code)
        {
            List<parameter> listData = new List<parameter>();
            DataTable objTab = new DataTable();
            object tableInstance = null;
            var filtre = "";
            switch (code)
            {
                case "Depense":
                case "Recette":
                    tableInstance = new mOperationCaisse(maConnexion);
                    break;
            }
            if (tableInstance != null)
            {
                var tableType = tableInstance.GetType();
                var remplirDataTableMethod = tableType.GetMethod("RemplirDataTable", new Type[] { typeof(string) });
                if (remplirDataTableMethod != null)
                {
                    switch (code)
                    {
                        case "Depense":
                            filtre = $"Type = 'D'";
                            objTab = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { filtre });
                            break;
                        case "Recette":
                            filtre = $"Type = 'R'";
                            objTab = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { filtre });
                            break;
                        default:
                            objTab = (DataTable)remplirDataTableMethod.Invoke(tableInstance, new object[] { "" });
                            break;
                    }
                }
            }
            // Remplissage de la liste
            switch (code)
            {
                case "Depense":
                case "Recette":
                    foreach (DataRow row in objTab.Rows)
                    {
                        listData.Add(new parameter()
                        {
                            code = row["code"].ToString(),
                            montant = row["montant"].ToString()
                        });
                    }
                    break;
            }
        }
    }
}
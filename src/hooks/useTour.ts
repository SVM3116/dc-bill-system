import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function useDashboardTour() {
  useEffect(() => {
    // Check if the tour was already completed
    const completed = localStorage.getItem("kreis_tour_completed");
    if (completed === "true") return;

    // Initialize driver
    const driverObj = driver({
      showProgress: true,
      animate: true,
      steps: [
        {
          popover: {
            title: "Welcome to KREIS DC BILL Platform!",
            description: "Let's take a quick 1-minute tour to help you get familiar with the system features.",
          }
        },
        {
          element: '[data-tour="tour-dashboard"]',
          popover: {
            title: "Dashboard Overview",
            description: "Access summaries of drafts, generated bills, monthly expenditures, and recent activity logs at a glance.",
            side: "right",
            align: "start"
          }
        },
        {
          element: '[data-tour="tour-create-maintenance"]',
          popover: {
            title: "Create Maintenance DC Bill",
            description: "Record new school expenditures (e.g. food bills, repairs) and prepare the contingent sheet under your Maintenance Account.",
            side: "right",
            align: "start"
          }
        },
        {
          element: '[data-tour="tour-view-maintenance"]',
          popover: {
            title: "View Maintenance Bills",
            description: "Browse, filter, edit, duplicate, and print generated Maintenance D.C. Bills.",
            side: "right",
            align: "start"
          }
        },
        {
          element: '[data-tour="tour-create-salary"]',
          popover: {
            title: "Create Salary Bill",
            description: "Record monthly guest teacher and staff salary payments under your Salary Account.",
            side: "right",
            align: "start"
          }
        },
        {
          element: '[data-tour="tour-create-voucher"]',
          popover: {
            title: "Create Hand Voucher",
            description: "Prepare guest teacher honorariums, milling receipts, and transport vouchers in batch or single entry layouts.",
            side: "right",
            align: "start"
          }
        },
        {
          element: '[data-tour="tour-view-vouchers"]',
          popover: {
            title: "View Hand Vouchers",
            description: "Browse, edit, and print generated Hand Vouchers.",
            side: "right",
            align: "start"
          }
        },
        {
          element: '[data-tour="tour-cheque"]',
          popover: {
            title: "Cheque Register",
            description: "Track all cheques and payment transactions issued by your school.",
            side: "right",
            align: "start"
          }
        },
        {
          element: '[data-tour="tour-setup"]',
          popover: {
            title: "School Setup & Configuration",
            description: "Update school details, bank accounts, and configure admin email alerts for generated documents.",
            side: "right",
            align: "start"
          }
        }
      ],
      onDestroyed: () => {
        localStorage.setItem("kreis_tour_completed", "true");
      }
    });

    // Run the tour
    setTimeout(() => {
      driverObj.drive();
    }, 1000);
  }, []);
}

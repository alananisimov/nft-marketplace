"use client";

import { AnimatePresence, motion } from "framer-motion";

import { DeliveryStage, useDelivery } from "../../model/hooks/use-delivery";
import { DeliveryConfirm } from "../delivery-confirm";
import { DeliveryForm } from "../delivery-form";
import { DeliveryList } from "../delivery-list";
import { DeliverySelect } from "../delivery-select";
import { DeliverySuccess } from "../delivery-success";
import { pageTransition, pageVariants } from "./animations";
import { DeliverySkeleton } from "./skeleton";

export function DeliveryFlow() {
  const {
    state: { stage, isLoading, selectedNFT, error },
    actions: {
      handleBack,
      handleSelect,
      handleConfirm,
      handleSubmitForm,
      setStage,
    },
    queries: { deliveryNFTs, availableNFTs },
  } = useDelivery();

  const renderContent = () => {
    switch (stage) {
      case DeliveryStage.LIST:
        return (
          <DeliveryList
            items={deliveryNFTs}
            availableItems={availableNFTs}
            onSelectNew={() => setStage(DeliveryStage.SELECT)}
          />
        );
      case DeliveryStage.SELECT:
        return (
          <DeliverySelect
            items={availableNFTs}
            onSelect={handleSelect}
            onBack={handleBack}
          />
        );
      case DeliveryStage.CONFIRM:
        return <DeliveryConfirm nft={selectedNFT} onConfirm={handleConfirm} />;
      case DeliveryStage.FORM:
        return (
          <DeliveryForm
            nft={selectedNFT}
            onSubmit={handleSubmitForm}
            onBack={handleBack}
          />
        );
      case DeliveryStage.SUCCESS:
        return <DeliverySuccess nft={selectedNFT} onBack={handleBack} />;
      default:
        return;
    }
  };

  if (isLoading) {
    return <DeliverySkeleton />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stage}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <div className="relative w-full">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-500">
                {error}
              </div>
            </motion.div>
          )}
          <div className="mr-4">{renderContent()}</div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

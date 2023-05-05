import { useState } from "react"

import { CheckboxModal } from "src/components/lib/checkboxModal"
import { ModalMenuButton, ModalTitle, SpinnerWithMargin } from "src/components/lib/modalElements"
import { deployment } from "src/deployment"
import {
  useCardsCollectionWrite,
  useDeckAirdropWrite,
  useInventoryWrite
} from "src/hooks/fableTransact"
import { CheckboxModalContentProps, useCheckboxModal } from "src/hooks/useCheckboxModal"

// =================================================================================================

const MintDeckModalContent = ({ modalControl, callback }: CheckboxModalContentProps) => {
  const [invDelegated, setInvDelegated] = useState(false)
  const [airDelegated, setAirDelegated] = useState(false)
  const [ loading, setLoading ] = useState<string>(null)

  const { write: approve } = useCardsCollectionWrite({
    functionName: "setApprovalForAll",
    args: [deployment.Inventory, true],
    setLoading,
    onSuccess() {
      setInvDelegated(true)
    }
  })

  const { write: delegate } = useInventoryWrite({
    functionName: "setDelegation",
    args: [deployment.DeckAirdrop, true],
    enabled: invDelegated,
    setLoading,
    onSuccess() {
      setAirDelegated(true)
    }
  })

  const { write: claim } = useDeckAirdropWrite({
    functionName: "claimAirdrop",
    enabled: airDelegated,
    setLoading,
    onSuccess() {
      modalControl.displayModal(false)
      callback?.()
    }
  })

  // TODO(LATER): check if we already have the approvals
  // TODO(LATER): pop a modal to indicate that the mint is successful? do something while getting collection

  // -----------------------------------------------------------------------------------------------

  if (loading) return <>
    <ModalTitle>{loading}</ModalTitle>
    <SpinnerWithMargin />
  </>

  return <>
    <ModalTitle>Minting Deck...</ModalTitle>
    <p className="py-4">
      Mint a deck of cards to play the game with your friends.
    </p>
    <button className="btn" onClick={approve} disabled={invDelegated || !approve}>
      Delegate to Inventory
    </button>
    <button className="btn" onClick={delegate} disabled={airDelegated || !invDelegated || !delegate}>
      Delegate to Airdropper
    </button>
    <button className="btn" onClick={claim} disabled={!airDelegated || !claim}>
      Mint Deck
    </button>
  </>
}

// =================================================================================================

export const MintDeckModal = ({ callback = () => {} }) => {
  const checkboxID = "mint"
  const modalControl = useCheckboxModal(checkboxID)

  return <>
    <ModalMenuButton htmlFor={checkboxID}>Mint Deck →</ModalMenuButton>
    <CheckboxModal id="mint" control={modalControl}>
      <MintDeckModalContent modalControl={modalControl} callback={callback} />
    </CheckboxModal>
  </>
}

// =================================================================================================


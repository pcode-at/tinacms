/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import React, { ReactElement, useState, useRef, useLayoutEffect } from 'react'
import debounce from 'lodash.debounce'

import { useEditorStateContext } from '../../context/editorState'
import { useEditorModeContext } from '../../context/editorMode'
import { MenuPortalProvider } from '../../context/MenuPortal'
import { Plugin } from '../../types'

import {
  MenuPlaceholder,
  MenuWrapper,
  MenuContainer,
} from '../MenuHelpers/styledComponents'

interface Props {
  sticky?: boolean | string
  menus?: ReactElement[]
  plugins?: Plugin[]
  popups?: ReactElement[]
}

function getOffsetTop(el: any, stickyOffset: string) {
  let distance = 0
  /**
   * traverses the dom up to get the true distance
   * of an element from the top of the document
   */
  if (el.offsetParent) {
    do {
      distance += el.offsetTop
      el = el.offsetParent
    } while (el)
  }

  const _stickyOffset = parseInt(stickyOffset, 10)

  return distance < 0 ? 0 : distance - _stickyOffset
}

export const BaseMenubar = ({
  sticky = true,
  menus,
  plugins,
  popups,
}: Props) => {
  const [menuFixed, setMenuFixed] = useState(false)
  const isBrowser = typeof window !== `undefined`
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOffsetTop, setMenuOffsetTop] = useState<number | null>(null)
  const stickyOffset = typeof sticky === 'string' ? sticky : '0'
  const scrollY = useRef<number>(0)
  const scrollAnimationRef = useRef<number>(0)
  const { editorView } = useEditorStateContext()
  const { mode } = useEditorModeContext()

  useLayoutEffect(() => {
    if (!isBrowser || !menuRef.current || !sticky) {
      return
    }
    const wysiwygWrapper = menuRef.current!.parentElement
    let ticking = false

    const handleStickyMenu = () => {
      if (typeof menuOffsetTop === 'number') {
        const btmBound = menuOffsetTop + (wysiwygWrapper?.offsetHeight || 0)

        if (scrollY.current > menuOffsetTop && scrollY.current < btmBound) {
          setMenuFixed(true)
        } else {
          setMenuFixed(false)
        }
      }
      scrollAnimationRef.current = requestAnimationFrame(handleStickyMenu)
    }

    /**
     * ensures the animation frames start and stop while
     * actively scrolling. To avoid unnecessary layout calcs
     *  */
    const handleScrollStart = debounce(
      () => {
        scrollY.current = window.scrollY
        requestTick()
      },
      10,
      { leading: true, trailing: false }
    )

    const handleScrollStop = debounce(() => {
      cancelAnimationFrame(scrollAnimationRef.current)
      ticking = false
    }, 10)

    function requestTick() {
      if (!ticking) {
        scrollAnimationRef.current = requestAnimationFrame(handleStickyMenu)
      }
      ticking = true
    }

    // ensures the offset is calculated once images load
    window.onload = () =>
      setMenuOffsetTop(getOffsetTop(wysiwygWrapper, stickyOffset))
    window.addEventListener('scroll', handleScrollStart)
    window.addEventListener('scroll', handleScrollStop)

    return () => {
      window.removeEventListener('scroll', handleScrollStart)
      window.removeEventListener('scroll', handleScrollStop)
      cancelAnimationFrame(scrollAnimationRef.current)
    }
  }, [menuRef, menuOffsetTop])

  const preventProsemirrorFocusLoss = React.useCallback((e: any) => {
    e.stopPropagation()
    e.preventDefault()
  }, [])

  return (
    <>
      <div ref={menuRef}>
        {menuFixed && (
          <MenuPlaceholder
            menuBoundingBox={menuRef.current?.getBoundingClientRect()}
          ></MenuPlaceholder>
        )}
        <MenuWrapper
          menuFixedTopOffset={stickyOffset}
          menuFixed={menuFixed}
          menuBoundingBox={menuRef.current?.getBoundingClientRect()}
          data-testid="base-menubar"
        >
          <MenuPortalProvider>
            <MenuContainer onMouseDown={preventProsemirrorFocusLoss}>
              {menus}
              {plugins?.map(({ name, MenuItem }) => (
                <MenuItem key={name} mode={mode} editorView={editorView} />
              ))}
            </MenuContainer>
          </MenuPortalProvider>
        </MenuWrapper>
      </div>
      {popups}
    </>
  )
}

// todo: sub-menus to return null if schema does not have related type of node / mark.

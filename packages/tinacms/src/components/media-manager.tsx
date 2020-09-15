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

import React from 'react'
import { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { useCMS } from '../react-tinacms'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFullscreen,
} from '@tinacms/react-modals'
import { MediaList, Media } from '@tinacms/core'
import path from 'path'
import { Folder, File } from '@tinacms/icons'
import { Button } from '@tinacms/styles'

export interface MediaRequest {
  limit?: number
  directory?: string
  onSelect?(media: Media): void
  close?(): void
}

export function MediaManager() {
  const cms = useCMS()

  const [request, setRequest] = useState<MediaRequest | undefined>()

  useEffect(() => {
    return cms.events.subscribe('media:open', ({ type, ...request }) => {
      setRequest(request)
    })
  }, [])

  if (!request) return null

  const close = () => setRequest(undefined)

  return (
    <Modal>
      <ModalFullscreen>
        <ModalHeader close={close}>Media Manager</ModalHeader>
        <ModalBody padded={true}>
          <MediaPicker {...request} close={close} />
        </ModalBody>
      </ModalFullscreen>
    </Modal>
  )
}

export function MediaPicker({ onSelect, close, ...props }: MediaRequest) {
  const [directory, setDirectory] = useState<string | undefined>(
    props.directory
  )
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(props.limit || 50)
  const [list, setList] = useState<MediaList>({
    limit,
    offset,
    items: [],
    totalCount: 0,
  })
  const cms = useCMS()

  useEffect(() => {
    cms.media.list({ offset, limit, directory }).then(setList)
  }, [offset, limit, directory])

  if (!list) return <div>Loading...</div>

  const onClickMediaItem = (item: Media) => {
    if (item.type === 'dir') {
      setDirectory(path.join(item.directory, item.filename))
      setOffset(0)
    }
  }

  let selectMediaItem: any

  if (onSelect) {
    selectMediaItem = (item: Media) => {
      onSelect(item)
      if (close) close()
    }
  }

  return (
    <MediaPickerWrap>
      <Breadcrumb directory={directory} setDirectory={setDirectory} />
      <div>
        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {list.items.map((item: Media) => (
            <MediaListItem
              item={item}
              onClick={onClickMediaItem}
              onSelect={selectMediaItem}
            />
          ))}
        </ul>
      </div>
      <PageLinks list={list} setOffset={setOffset} />
    </MediaPickerWrap>
  )
}

const MediaPickerWrap = styled.div`
  height: 90vh;
  padding-bottom: 5rem;
  overflow-y: scroll;
  color: var(--tina-color-grey-9);
`

interface BreadcrumbProps {
  directory?: string
  setDirectory: (directory: string) => void
}

function Breadcrumb({ directory, setDirectory }: BreadcrumbProps) {
  return (
    <BreadcrumbWrapper>
      {/**TODO: find a better label for 'Root'
       * Maybe it should be the directory name if its set
       */}
      <button onClick={() => setDirectory('')}>Root</button>
      <span>/</span>
      {directory &&
        directory.split('/').map((part, index, parts) => (
          <>
            <button
              onClick={() => {
                setDirectory(parts.slice(0, index + 1).join('/'))
              }}
            >
              {part}
            </button>
            <span>/</span>
          </>
        ))}
    </BreadcrumbWrapper>
  )
}

const BreadcrumbWrapper = styled.div`
  width: 100%;
  display: flex;
  padding-bottom: var(--tina-padding-small);
  color: var(--tina-color-grey-4);
  font-size: var(--tina-font-size-2);

  > *:not(:first-child) {
    padding-left: 8px;
  }
`

interface MediaListItemProps {
  item: Media
  onClick: (item: Media) => void
  onSelect: (item: Media) => void
}

function MediaListItem({ item, onClick, onSelect }: MediaListItemProps) {
  return (
    <ListItem onClick={() => onClick(item)}>
      <ItemPreview>
        <MediaPreview src={item.previewSrc} item={item} />
      </ItemPreview>
      <span style={{ flexGrow: 1 }}>
        {item.filename}
        {item.type === 'dir' && '/'}
      </span>
      {onSelect && item.type === 'file' && (
        <div style={{ minWidth: '100px' }}>
          <Button small onClick={() => onSelect(item)}>
            Insert
          </Button>
        </div>
      )}
    </ListItem>
  )
}

function MediaPreview({
  src = '',
  item,
}: {
  src: string | undefined
  item: Media
}) {
  const isValidImg = /\.(jpe?g|png)$/.test(src)
  const icon = item.type === 'file' ? <File /> : <Folder />

  return isValidImg ? <img src={src} /> : icon
}

const ListItem = styled.li`
  display: flex;
  align-items: center;
  padding: var(--tina-padding-big) var(--tina-padding-small);
  background-color: transparent;
  transition: background-color 300ms ease;
  border-bottom: 1px solid var(--tina-color-grey-2);

  > *:not(:first-child) {
    margin-left: var(--tina-padding-big);
  }

  &:hover {
    background-color: var(--tina-color-grey-1);
    border-radius: var(--tina-radius-small);
    cursor: pointer;
  }
`

const ItemPreview = styled.div`
  width: 56px;
  border-radius: var(--tina-radius-small);
  overflow: hidden;
  display: flex;
  justify-content: center;

  > img {
    min-height: 56px;
    object-fit: cover;
  }

  > svg {
    width: 47%;
    height: 100%;
    fill: var(--tina-color-grey-4);
  }
`

interface PageLinksProps {
  list: MediaList
  setOffset: (offset: number) => void
}

/**
 * TODO:
 * add next / prev page link arrow icons
 * if there's just one page, should we even show the page links?
 *  */
function PageLinks({ list, setOffset }: PageLinksProps) {
  const limit = list.limit || 10
  const numPages = Math.ceil(list.totalCount / limit)
  const lastItemIndexOnPage = list.offset + limit
  const currentPageIndex = lastItemIndexOnPage / limit
  let pageLinks = []

  for (let i = 1; i <= numPages; i++) {
    const active = i === currentPageIndex
    pageLinks.push(
      <PageNumber active={active} onClick={() => setOffset(i * limit)}>
        {i}
      </PageNumber>
    )
  }

  return <PageLinksWrap>{pageLinks}</PageLinksWrap>
}

const PageLinksWrap = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin: 0 var(--tina-padding-big);
`

const PageNumber = styled.button<{ active: boolean }>`
  padding: 0 0.15rem;
  margin: var(--tina-padding-small);
  transition: border 180ms ease;

  ${p =>
      !p.active &&
      css`
        color: var(--tina-color-grey-4);
      `}
    :hover {
    border-bottom: 1px solid var(--tina-color-grey-9);
  }
`

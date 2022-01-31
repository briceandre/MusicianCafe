/* Define a dedicated ajax transport for binary opus files download */
$.ajaxTransport("+binary", function (options, originalOptions, jqXHR)
{
    // check for conditions and support for blob / arraybuffer response type
    if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob))))) {
        return {
            // create new XMLHttpRequest
            send: function (headers, callback) {
                // setup all variables
                var xhr = new XMLHttpRequest(),
                    url = options.url,
                    type = options.type,
                    async = options.async || true,
                    // blob or arraybuffer. Default is blob
                    dataType = options.responseType || "blob",
                    data = options.data || null,
                    username = options.username || null,
                    password = options.password || null;

                xhr.addEventListener('load', function () {
                    var data = {};
                    data[options.dataType] = xhr.response;
                    // make callback and send data
                    callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
                });

                xhr.open(type, url, async, username, password);

                // setup custom headers
                for (var i in headers) {
                    xhr.setRequestHeader(i, headers[i]);
                }

                xhr.responseType = dataType;
                xhr.send(data);
            },
            abort: function () {
                jqXHR.abort();
            }
        };
    }
});

function MusicianCafeParseUserInfo(data, full)
{
   if (full)
   {
      return {'id': data.getId(),
              'email': data.getEmail(),
              'name': data.getName(),
              'email_confirmed': data.getEmail_confirmed(),
              'storage_limit_MB': data.getStorage_limit_MB(),
              'upload_daily_limit_MB': data.getUpload_daily_limit_MB(),
              'site_moderator': data.getSite_moderator(),
              'current_storage_MB': data.getCurrent_storage_MB(),
              'current_day_upload_MB': data.getCurrent_day_upload_MB(),
              'max_sample_size_MB': data.getMax_sample_size_MB()}
   }
   else
   {
      return {'id': data.getId(),
              'name': data.getName(),
              'site_moderator': data.getSite_moderator()}
   }
}

function MusicianCafeParseSampleInfo(k)
{
   return {'id': k.getId(),
           'name': k.getName(),
           'piece_id': k.getPiece_id(),
           'user_id': k.getUser_id(),
           'user_name': k.getUser_name(),
           'composer_id': k.getComposer_id(),
           'piece_name': k.getPiece_name(),
           'composer_name': k.getComposer_name(),
           'is_own': k.getIs_own(),
           'is_common': k.getIs_common(),
           'is_approved': k.getIs_approved(),
           'show_on_welcome_page': k.getShow_on_welcome_page(),
           'is_favorite': k.getIs_favorite(),
           'message_to_moderator': k.getMessage_to_moderator(),
           'duration': k.getDuration(),
           'album_id': k.getAlbum_id(),
           'album_name': k.getAlbum_name()}
}

function MusicianCafeParsePartitionInfo(p)
{
   return {'id': p.getId(),
           'name': p.getName(),
           'has_mxl': p.getHas_mxl(),
           'composer_id': p.getComposer_id(),
           'composer_name': p.getComposer_name(),
           'piece_id': p.getPiece_id(),
           'piece_name': p.getPiece_name(),
           'album_id': p.getAlbum_id(),
           'album_name': p.getAlbum_name(),
           'user_id': p.getUser_id(),
           'user_name': p.getUser_name(),
           'is_own': p.getIs_own(),
           'is_favorite': p.getIs_favorite()}
}

function MusicianCafeRegister(email, password, name, token, success, failed)
{
   PerformSoap('Register', function(r)
   {
      if (r.getStatus() == 0)
      {
         success(MusicianCafeParseUserInfo(r.getUser_info(), true));
      }
      else
      {
         failed(r.getStatus());
      }
   },  failed, [email, password, name, token])
}

function MusicianCafeConfirmEMail(code, success, failed)
{
   PerformSoap('ConfirmEMail', function(r)
   {
      if (r.getStatus() == 0)
      {
         success(MusicianCafeParseUserInfo(r.getUser_info(), true));
      }
      else
      {
         failed(r.getStatus());
      }
   },
   failed, [code])
}

function MusicianCafeRequestEMailConfirmation(email, success, failed)
{
   PerformSoap('RequestEMailConfirmation', function(r)
   {
      if (r.getStatus() == 0)
      {
         success();
      }
      else
      {
         failed(r.getStatus());
      }
   },
   failed, [email])
}

function MusicianCafeResetPassword(email, token, success, failed)
{
   PerformSoap('ResetPassword', function(r)
   {
      if (r.getStatus() == 0)
      {
         success();
      }
      else
      {
         failed();
      }
   },
   failed, [email, token])
}

function MusicianCafeLogin(username, password, success, failed)
{
   PerformSoap('Login', function(r)
   {
      if (r.getStatus() == 0)
      {
         success(MusicianCafeParseUserInfo(r.getUser_info(), true));
      }
      else
      {
         failed();
      }
   },
   failed, [username, password])
}

function MusicianCafeGetLoggedUserInfo(success, failed)
{
   PerformSoap('GetLoggedUserInfo', function(r)
   {
      if (r.getStatus() == 0)
      {
         success(MusicianCafeParseUserInfo(r.getUser_info(), true));
      }
      else
      {
         failed();
      }
   },
   failed, [])
}

function MusicianCafeChangePassword(username, old_password, new_password, success, failed)
{
   PerformSoap('ChangePassword', function(r)
   {
      if (r.getStatus() == 0)
      {
         success(MusicianCafeParseUserInfo(r.getUser_info(), true));
      }
      else
      {
         failed();
      }
   },
   failed, [username, old_password, new_password])
}

function MusicianCafeGetSamples(success, failed)
{
   PerformSoap('GetSamples', function(r)
   {
      var samples = []
      r.getSamples().forEach(function(k)
      {
         samples.push(MusicianCafeParseSampleInfo(k));
      })
      success(samples);
   },
   failed, [null])
}

function MusicianCafeGetSamplesByPiece(piece, success, failed)
{
   PerformSoap('GetSamples', function(r)
   {
      var samples = []
      r.getSamples().forEach(function(k)
      {
         samples.push(MusicianCafeParseSampleInfo(k));
      })
      success(samples);
   },
   failed, [piece])
}

function MusicianCafeGetFavoriteSamplesAndPartitions(success, failed)
{
   PerformSoap('GetFavoriteSamplesAndPartitions', function(r)
   {
      var samples = []
      r.getSamples().forEach(function(k)
      {
         samples.push(MusicianCafeParseSampleInfo(k));
      })
      var partitions = []
      r.getPartitions().forEach(function(k)
      {
         partitions.push(MusicianCafeParsePartitionInfo(k));
      })
      success(samples, partitions);
   },
   failed, [])
}

function MusicianCafeGetSamplesForModeration(success, failed)
{
   PerformSoap('GetSamplesForModeration', function(r)
   {
      var samples = []
      r.getSamples().forEach(function(k)
      {
         samples.push(MusicianCafeParseSampleInfo(k));
      })
      success(samples);
   },
   failed, [])
}

function MusicianCafeGetSharedSamplesAndPartitions(success, failed)
{
   PerformSoap('GetSharedSamplesAndPartitions', function(r)
   {
      var samples = []
      r.getSamples().forEach(function(k)
      {
         samples.push(MusicianCafeParseSampleInfo(k));
      })
      var partitions = []
      r.getPartitions().forEach(function(k)
      {
         partitions.push(MusicianCafeParsePartitionInfo(k));
      })
      success(samples, partitions);
   },
   failed, [])
}

function MusicianCafeGetSharedSample(shared_id, success, failed)
{
   PerformSoap('GetSharedSample', function(r)
   {
      success(MusicianCafeParseSampleInfo(r.getSample()),
              MusicianCafeParseUserInfo(r.getSender_info(), true),
              r.getMessage());
   },
   failed, [shared_id])
}

function MusicianCafeSetSharedSampleAcceptation(shared_id, accepted, success, failed)
{
   PerformSoap('SetSharedSampleAcceptation', function(r)
   {
      success();
   },
   failed, [shared_id, accepted])
}

function MusicianCafeGetSamplesAndPartitionsByPiece(piece, success, failed)
{
   PerformSoap('GetSamplesAndPartitionsByPiece', function(r)
   {
      var samples = []
      r.getSamples().forEach(function(k)
      {
         samples.push(MusicianCafeParseSampleInfo(k));
      })
      var partitions = [];
      r.getPartition().forEach(function(p)
      {
         partitions.push(MusicianCafeParsePartitionInfo(p))
      })
      success(samples, partitions);
   },
   failed, [piece])
}

function MusicianCafeGetSampleInfo(sample_id, success, failed)
{
   PerformSoap('GetSampleInfo', function(r)
   {
      success(MusicianCafeParseSampleInfo(r.getInfo()));
   },
   failed, [sample_id])
}

function MusicianCafeGetSampleLink(sample_id, success, failed)
{
   PerformSoap('GetSampleLink', function(r)
   {
      success(r.getLink());
   },
   failed, [sample_id])
}

function MusicianCafeGetComposers(success, failed)
{
   PerformSoap('GetComposers', function(r)
   {
      var composers = [];
      r.getComposer().forEach(function(k)
      {
         composers.push({'id': k.getId(),
                         'name': k.getName(),
                         'is_global': k.getIs_global()});
      })

      /* Init screen */
      success(composers);
   },
   function(){failed()}, [])
}

function MusicianCafeGetComposerInfo(composer_id, success, failed)
{
   PerformSoap('GetComposerInfo', function(r)
   {
      success({'id': r.getInfo().getId(),
               'name': r.getInfo().getName(),
                  'is_global': r.getInfo().getIs_global()});
   },
   function(){failed()}, [composer_id])
}

function MusicianCafeGetSampleStream(sample_id, download_link_callback, success, failed)
{
   /* Check if we have in cache */
   CheckInCache('sample', sample_id, success, function()
   {
      download_link_callback(function(url)
      {
         if (window.music_play_test_proxy)
         {
            url = window.music_play_test_proxy+'/proxy?'+btoa(url);
         }
         $.ajax({
            type: 'GET',
            dataType: 'binary',
            processData: false,
            url: url
         }).done(
         function(data)
         {
            const reader = new FileReader();

            reader.addEventListener("loadend", function()
            {
               var data = new Uint8Array(reader.result);
               StoreInCache('sample', sample_id, data);
               success(data);
            });

            reader.readAsArrayBuffer(data);
         });
      });
   })
}

function MusicianCafeGetPartitionStream(partition_id, download_link_callback, success, failed)
{
   /* Check if we have in cache */
   CheckInCache('partition', partition_id, success, function()
   {
      download_link_callback(function(url)
      {
         if (window.music_play_test_proxy)
         {
            url = window.music_play_test_proxy+'/proxy?'+btoa(url);
         }
         $.ajax({
            type: 'GET',
            dataType: 'binary',
            processData: false,
            url: url
         }).done(
         function(data)
         {
            const reader = new FileReader();

            reader.addEventListener("loadend", function()
            {
               var data = new Uint8Array(reader.result);
               StoreInCache('partition', partition_id, data);
               success(data);
            });

            reader.readAsArrayBuffer(data);
         });
      });
   })
}

function MusicianCafeAddComposer(name, success, failed)
{
   PerformSoap('AddComposer', function(r)
   {
      if (r.getStatus() == 0)
      {
         success({id: r.getComposer_info().getId(),
            name: r.getComposer_info().getName()});
      }
      else
      {
         failed(r.getStatus())
      }
   },
   failed, [name])
}

function MusicianCafeAddPiece(name, composer_id, success, failed)
{
   PerformSoap('AddPiece', function(r)
   {
      if (r.getStatus() == 0)
      {
         success({id: r.getPiece_info().getId(),
                  name: r.getPiece_info().getName(),
                  composer_name: r.getPiece_info().getComposer_name(),
                  composer_id: r.getPiece_info().getComposer_id(),
                  album_id: r.getPiece_info().getAlbum_id(),
                  album_name: r.getPiece_info().getAlbum_name()});
      }
      else
      {
         failed(r.getStatus())
      }
   },
   failed, [composer_id, name])
}

function MusicianCafeGetPiecesByAlbum(album_id, success, failed)
{
   PerformSoap('GetPiecesByAlbum', function(r)
   {
      var pieces = []
      r.getPiece().forEach(function(k)
      {
         pieces.push({'id': k.getId(),
                      'composer_id': k.getComposer_id(),
                      'composer_name': k.getComposer_name(),
                      'name': k.getName(),
                      'album_id': k.getAlbum_id(),
                      'album_name': k.getAlbum_name(),
                      'is_global': k.getIs_global()});
      })
      success(pieces);
   },
   function(){failed()}, [album_id])
}

function MusicianCafeGetPiecesAndAlbumsByComposer(composer_id, success, failed)
{
   PerformSoap('GetPiecesAndAlbumsByComposer', function(r)
   {
      var pieces = []
      r.getPiece().forEach(function(k)
      {
         pieces.push({'id': k.getId(),
                      'composer_id': k.getComposer_id(),
                      'composer_name': k.getComposer_name(),
                      'name': k.getName(),
                      'album_id': k.getAlbum_id(),
                      'album_name': k.getAlbum_name(),
                      'is_global': k.getIs_global()});
      })
      var albums = []
      r.getAlbum().forEach(function(k)
      {
         albums.push({'id': k.getId(),
                      'name': k.getName(),
                      'is_global': k.getIs_global()});
      })

      success(pieces, albums);
   },
   function(){failed()}, [composer_id])
}

function MusicianCafeGetPieceInfo(piece_id, success, failed)
{
   PerformSoap('GetPieceInfo', function(r)
   {
      success({'id': r.getInfo().getId(),
               'composer_id': r.getInfo().getComposer_id(),
               'composer_name': r.getInfo().getComposer_name(),
               'name': r.getInfo().getName(),
               'album_id': r.getInfo().getAlbum_id(),
               'album_name': r.getInfo().getAlbum_name(),
               'is_global': r.getInfo().getIs_global(),
               'album_is_global': r.getInfo().getAlbum_is_global()});
   },
   function(){failed()}, [piece_id])
}

function MusicianCafeUploadSample(piece_id,name,opus, success, failed)
{
   PerformSoap('UploadSample', function(r)
   {
      k = r.getSample_info();
      success(MusicianCafeParseSampleInfo(k));
   },
   failed, [piece_id,name,opus])
}

function MusicianCafeSuppressSample(sample_id, success, failed)
{
   PerformSoap('SuppressSample', function(r)
   {
      success();
   },
   failed, [sample_id])
}

function MusicianCafeChangeSampleIsOwn(sample_id, is_own, success, failed)
{
   PerformSoap('ChangeSampleIsOwn', function(r)
   {
      success(MusicianCafeParseSampleInfo(r.getSample_info()));
   },
   failed, [sample_id, is_own])
}

function MusicianCafeChangeSampleIsCommon(sample_id, is_common, message, success, failed)
{
   PerformSoap('ChangeSampleIsCommon', function(r)
   {
      success(MusicianCafeParseSampleInfo(r.getSample_info()));
   },
   failed, [sample_id, is_common, message])
}

function MusicianCafeChangeSampleShowOnWelcomePage(sample_id, show_on_welcome_page, success, failed)
{
   PerformSoap('ChangeSampleShowOnWelcomePage', function(r)
   {
      success(MusicianCafeParseSampleInfo(r.getSample_info()));
   },
   failed, [sample_id, show_on_welcome_page])
}

function MusicianCafeChangeSamplePiece(sample_id, piece_id, success, failed)
{
   PerformSoap('ChangeSamplePiece', function(r)
   {
      success(MusicianCafeParseSampleInfo(r.getSample_info()));
   },
   failed, [sample_id, piece_id, ])
}

function MusicianCafeChangeSampleIsFavorite(sample_id, is_in_favorite, success, failed)
{
   PerformSoap('ChangeSampleIsFavorite', function(r)
   {
      success(MusicianCafeParseSampleInfo(r.getSample_info()));
   },
   failed, [sample_id, is_in_favorite])
}

function MusicianCafeApproveSampleIsCommon(sample_id, success, failed)
{
   PerformSoap('ApproveSampleIsCommon', function(r)
   {
      success(MusicianCafeParseSampleInfo(r.getSample_info()));
   },
   failed, [sample_id])
}

function MusicianCafeSuppressSampleFromCommon(sample_id, message, success, failed)
{
   PerformSoap('SuppressSampleFromCommon', function(r)
   {
      success();
   },
   failed, [sample_id, message])
}

function MusicianCafeGetFavoriteMembers(success, failed)
{
   PerformSoap('GetFavoriteMembers', function(r)
   {
      var result = [];
      r.getUser_info().forEach(function(k)
      {
         result.push(MusicianCafeParseUserInfo(k, false));
      })
      success(result);
   },
   failed, [])
}

function MusicianCafeSearchMember(name, success, failed)
{
   PerformSoap('SearchMember', function(r)
   {
      if (r.getUser_info())
      {
         success(MusicianCafeParseUserInfo(r.getUser_info(), false));
      }
      else
      {
         success(false);
      }
   },
   failed, [name])
}

function MusicianCafeChangeMemberIsFavorite(user_id, is_favorite, success, failed)
{
   PerformSoap('ChangeMemberIsFavorite', success, failed, [user_id, is_favorite])
}

function MusicianCafeShareSampleWithMember(sample_id, member_id, message, success, failed)
{
   PerformSoap('ShareSampleWithMember', success, failed, [sample_id, member_id, message])
}

function MusicianCafeGetNews(success, failed)
{
   PerformSoap('GetNews', function(r)
   {
      var result = []
      r.getNews().forEach(function(e)
      {
         result.push({'type': e.getType(),
                      'target_id': e.getTarget_id(),
                      'subject': e.getSubject()});
      })
      success(result);
   },
   failed, [])
}

function MusicianCafeGetMessage(message_id, success, failed)
{
   PerformSoap('GetMessage', function(r)
   {
      m = r.getMessage()
      console.log(m);
      success({'sender_info': MusicianCafeParseUserInfo(m.getSender_info(), false),
               'subject': m.getSubject(),
               'message': m.getMessage()});
   },
   failed, [message_id])
}

function MusicianCafeGetPartitionScrollings(partition_id, success, failed)
{
   PerformSoap('GetPartitionScrollings', function(r)
   {
      var scrollings = [];
      r.getScrolling().forEach(function(p)
      {
         scrollings.push({'id': p.getId(),
                          'name': p.getName(),
                          'pages': p.getPages()})
      })
      success(scrollings);
   },
   failed, [partition_id])
}

function MusicianCafeGetPartitionLink(partition_id, success, failed)
{
   PerformSoap('GetPartitionLink', function(r)
   {
      success(r.getLink());
   },
   failed, [partition_id])
}

function MusicianCafeMergeComposers(from, to, success, failed)
{
   PerformSoap('MergeComposers', success, failed, [from, to])
}

function MusicianCafeValidateComposer(id, success, failed)
{
   PerformSoap('ValidateComposer', success, failed, [id])
}

function MusicianCafeRenameComposer(composer_id, name, success, failed)
{
   PerformSoap('RenameComposer', success, failed, [composer_id, name])
}

function MusicianCafeMergePieces(from, to, success, failed)
{
   PerformSoap('MergePieces', success, failed, [from, to])
}

function MusicianCafeValidatePiece(id, success, failed)
{
   PerformSoap('ValidatePiece', success, failed, [id])
}

function MusicianCafeRenamePiece(piece_id, name, success, failed)
{
   PerformSoap('RenamePiece', success, failed, [piece_id, name])
}

function MusicianCafeAddAlbum(name, composer_id, success, failed)
{
   PerformSoap('AddAlbum', function(r)
   {
      if (r.getStatus() == 0)
      {
         success({'id': r.getAlbum_info().getId(),
                  'name': r.getAlbum_info().getName(),
                  'is_global': r.getAlbum_info().getIs_global()});
      }
      else
      {
         failed(r.getStatus())
      }
   },
   failed, [composer_id, name])
}

function MusicianCafeMergeAlbums(from, to, success, failed)
{
   PerformSoap('MergeAlbums', success, failed, [from, to])
}

function MusicianCafeValidateAlbum(id, success, failed)
{
   PerformSoap('ValidateAlbum', success, failed, [id])
}

function MusicianCafeRenameAlbum(piece_id, name, success, failed)
{
   PerformSoap('RenameAlbum', success, failed, [piece_id, name])
}


function MusicianCafeGetAlbumsByComposer(composer_id, success, failed)
{
   PerformSoap('GetAlbumsByComposer', function(r)
   {
      var albums = []
      r.getAlbum().forEach(function(k)
      {
         albums.push({'id': k.getId(),
                      'name': k.getName(),
                      'is_global': k.getIs_global()});
      })

      success(albums);
   },
   function(){failed()}, [composer_id])
}

function MusicianCafeGetAlbumInfo(album_id, success, failed)
{
   PerformSoap('GetAlbumInfo', function(r)
   {
      success({'id': r.getInfo().getId(),
               'name': r.getInfo().getName(),
               'is_global': r.getInfo().getIs_global()});
   },
   function(){failed()}, [album_id])
}

function MusicianCafeChangePieceAlbum(piece_id, album_id, success, failed)
{
   PerformSoap('ChangePieceAlbum', function(r)
   {
      success({'id': r.getPiece_info().getId(),
               'name': r.getPiece_info().getName(),
               'composer_name': r.getPiece_info().getComposer_name(),
               'composer_id': r.getPiece_info().getComposer_id(),
               'album_id': r.getPiece_info().getAlbum_id(),
               'album_name': r.getPiece_info().getAlbum_name()});
   },
   function(){failed()}, [piece_id, album_id])
}

function MusicianCafeUploadPartition(piece_id, name, data, scrolling_name, scrolling, mxl_data, mxl_info, success, failed)
{
   PerformSoap('UploadPartition', function(r)
   {
      p = r.getPartition_info();
      success(MusicianCafeParsePartitionInfo(p));
   },
   failed, [piece_id, name, data, scrolling_name, scrolling, mxl_data, mxl_info])
}

function MusicianCafeAddPartitionVariant(original_partition_id, name, data, scrolling_name, scrolling, mxl_info, success, failed)
{
   PerformSoap('AddPartitionVariant', function(r)
   {
      p = r.getPartition_info();
      success(MusicianCafeParsePartitionInfo(p));
   },
   failed, [original_partition_id, name, data, scrolling_name, scrolling, mxl_info])
}

function MusicianCafeChangePartitionIsFavorite(partition_id, is_in_favorite, success, failed)
{
   PerformSoap('ChangePartitionIsFavorite', function(r)
   {
      success(MusicianCafeParsePartitionInfo(r.getPartition_info()));
   },
   failed, [partition_id, is_in_favorite])
}

function MusicianCafeSharePartitionWithMember(partition_id, member_id, message, success, failed)
{
   PerformSoap('SharePartitionWithMember', success, failed, [partition_id, member_id, message])
}

function MusicianCafeGetSharedPartition(shared_id, success, failed)
{
   PerformSoap('GetSharedPartition', function(r)
   {
      success(MusicianCafeParsePartitionInfo(r.getPartition()),
              MusicianCafeParseUserInfo(r.getSender_info(), true),
              r.getMessage());
   },
   failed, [shared_id])
}

function MusicianCafeSetSharedPartitionAcceptation(shared_id, accepted, success, failed)
{
   PerformSoap('SetSharedPartitionAccepted', function(r)
   {
      success();
   },
   failed, [shared_id, accepted])
}

function MusicianCafeSuppressPartition(partition_id, success, failed)
{
   PerformSoap('SuppressPartition', function(r)
   {
      success();
   },
   failed, [partition_id])
}

function MusicianCafeGetPartitionMXLData(partition_id, success, failed)
{
   /* Check if we have in cache */
   CheckInCache('partition_mxl', partition_id, success, function()
   {
      PerformSoap('GetPartitionMXLLink', function(r)
      {
         url = r.getMXL_link()
         if (window.music_play_test_proxy)
         {
            url = window.music_play_test_proxy+'/proxy?'+btoa(url);
         }
         $.ajax({
            type: 'GET',
            dataType: 'binary',
            processData: false,
            url: url
         }).done(
         function(data)
         {
            const reader = new FileReader();

            reader.addEventListener("loadend", function()
            {
               var data = new Uint8Array(reader.result);
               StoreInCache('partition_mxl', partition_id, data);

               var full_data = {}
               full_data.MXL_data = data;
               full_data.MXL_info = atob(r.getMXL_info());

               StoreInCache('partition_mxl', partition_id, full_data);
               success(full_data);
            });

            reader.readAsArrayBuffer(data);
         });
      },
      failed, [partition_id])
   })
}